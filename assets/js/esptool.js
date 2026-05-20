var EspTool = (function() {
    'use strict';
    var ESP_FLASH_BEGIN = 0x02;
    var ESP_FLASH_DATA = 0x03;
    var ESP_FLASH_END = 0x04;
    var ESP_MEM_BEGIN = 0x05;
    var ESP_MEM_END = 0x06;
    var ESP_MEM_DATA = 0x07;
    var ESP_WRITE_REG = 0x09;
    var ESP_READ_REG = 0x0a;
    var ESP_SPI_ATTACH = 0x0d;
    var ESP_CHANGE_BAUDRATE = 0x0f;
    var ESP_FLASH_DEFL_BEGIN = 0x10;
    var ESP_FLASH_DEFL_DATA = 0x11;
    var ESP_FLASH_DEFL_END = 0x12;
    var ESP_SPI_SET_PARAMS = 0x0b;

    var ESP_FLASH_BLOCK_SIZE = 0x4000;
    var ESP_WRITE_SIZE = 0x400;
    var ESP_TIMEOUT = 3000;
    var ESP_SYNC_TIMEOUT = 100;
    var MEM_END_ROM_ADDR = 0x401001c0;

    var CHIP_DETECT_MAGIC_REG_ADDR = 0x40001000;
    var ESP8266_CHIP_MAGIC = 0xfff0c101;
    var ESP32_CHIP_MAGIC = 0x00f01d83;
    var ESP32S2_CHIP_MAGIC = 0x000007c6;
    var ESP32S3_CHIP_MAGIC = 0x000009;
    var ESP32C3_CHIP_MAGIC = 0x000006;

    var ESP_ROM_BAUD = 115200;
    var FLASH_SECTOR_SIZE = 0x1000;

    var _port = null;
    var _reader = null;
    var _writer = null;
    var _chip = null;
    var _flashSize = 0x400000;
    var _flashMode = 0;
    var _flashFreq = 0;

    function _encodeSLIP(data) {
        var out = [0xc0];
        for (var i = 0; i < data.length; i++) {
            var b = data[i];
            if (b === 0xc0) { out.push(0xdb); out.push(0xdc); }
            else if (b === 0xdb) { out.push(0xdb); out.push(0xdd); }
            else { out.push(b); }
        }
        out.push(0xc0);
        return new Uint8Array(out);
    }

    function _decodeSLIP(data) {
        var out = [];
        var i = 0;
        if (data[0] === 0xc0) i = 1;
        while (i < data.length) {
            if (data[i] === 0xc0) { i++; continue; }
            if (data[i] === 0xdb && i + 1 < data.length) {
                if (data[i + 1] === 0xdc) { out.push(0xc0); i += 2; continue; }
                if (data[i + 1] === 0xdd) { out.push(0xdb); i += 2; continue; }
            }
            out.push(data[i]);
            i++;
        }
        return new Uint8Array(out);
    }

    function _makePacket(op, data, checksum) {
        checksum = checksum || 0;
        var direction = 0;
        var payloadLen = data ? data.length : 0;
        var header = new Uint8Array(8);
        header[0] = direction;
        header[1] = op;
        header[2] = payloadLen & 0xff;
        header[3] = (payloadLen >> 8) & 0xff;
        header[4] = checksum & 0xff;
        header[5] = (checksum >> 8) & 0xff;
        header[6] = (checksum >> 16) & 0xff;
        header[7] = (checksum >> 24) & 0xff;
        var full = new Uint8Array(header.length + payloadLen);
        full.set(header);
        if (data) full.set(data, header.length);
        return _encodeSLIP(full);
    }

    function _calcChecksum(data) {
        var checksum = 0xef;
        for (var i = 0; i < data.length; i++) {
            checksum ^= data[i];
        }
        return checksum;
    }

    async function _readResponse(timeout) {
        timeout = timeout || ESP_TIMEOUT;
        var startTime = Date.now();
        var buffer = [];
        while (Date.now() - startTime < timeout) {
            if (!_reader) throw new Error('No reader available');
            try {
                var result = await _reader.read();
                if (result.done) break;
                for (var i = 0; i < result.value.length; i++) {
                    buffer.push(result.value[i]);
                }
                if (buffer.length >= 8 && buffer[buffer.length - 1] === 0xc0) {
                    var slipData = new Uint8Array(buffer);
                    var decoded = _decodeSLIP(slipData);
                    if (decoded.length < 8) throw new Error('Invalid response');
                    return {
                        direction: decoded[0],
                        op: decoded[1],
                        payload: decoded.slice(8)
                    };
                }
            } catch(e) {
                if (Date.now() - startTime >= timeout) throw new Error('Read timeout');
                await _sleep(10);
            }
        }
        throw new Error('Response timeout');
    }

    async function _command(op, data, checksum, timeout) {
        var packet = _makePacket(op, data, checksum);
        if (!_writer) throw new Error('No writer available');
        await _writer.write(packet);
        return await _readResponse(timeout);
    }

    async function _sync() {
        var syncPacket = new Uint8Array(36);
        syncPacket[0] = 0x07; syncPacket[1] = 0x07; syncPacket[2] = 0x12; syncPacket[3] = 0x20;
        for (var i = 4; i < 36; i++) syncPacket[i] = [0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55][i - 4] || 0x55;
        for (var i = 0; i < 5; i++) {
            try {
                var packet = _makePacket(0x08, syncPacket, 0);
                if (!_writer) throw new Error('No writer');
                await _writer.write(packet);
                await _sleep(10);
                try {
                    var resp = await _readResponse(100);
                    if (resp.op === 0x08) return true;
                } catch(e) {}
            } catch(e) {}
        }
        throw new Error('Failed to sync with ESP device');
    }

    async function _detectChip() {
        try {
            var resp = await _command(ESP_READ_REG, new Uint8Array([
                CHIP_DETECT_MAGIC_REG_ADDR & 0xff,
                (CHIP_DETECT_MAGIC_REG_ADDR >> 8) & 0xff,
                (CHIP_DETECT_MAGIC_REG_ADDR >> 16) & 0xff,
                (CHIP_DETECT_MAGIC_REG_ADDR >> 24) & 0xff
            ]), 0, 1000);
            var magic = resp.payload[0] | (resp.payload[1] << 8) | (resp.payload[2] << 16) | (resp.payload[3] << 24);
            if (magic === ESP8266_CHIP_MAGIC) return 'ESP8266';
            if (magic === ESP32_CHIP_MAGIC) return 'ESP32';
            if (magic === ESP32S2_CHIP_MAGIC) return 'ESP32-S2';
            if ((magic & 0xffff00) === (ESP32S3_CHIP_MAGIC & 0xffff00)) return 'ESP32-S3';
            if ((magic & 0xffff00) === (ESP32C3_CHIP_MAGIC & 0xffff00)) return 'ESP32-C3';
            return 'ESP32 (unknown magic: 0x' + magic.toString(16) + ')';
        } catch(e) {
            return 'ESP32 (detection failed)';
        }
    }

    async function connect(port) {
        _port = port;
        if (!('serial' in navigator)) throw new Error('Web Serial API not supported');
        if (!_port) {
            _port = await navigator.serial.requestPort();
        }
        await _port.open({ baudRate: ESP_ROM_BAUD });
        _reader = _port.readable.getReader();
        _writer = _port.writable.getWriter();
        await _sleep(100);
        await _setRTS(true);
        await _sleep(100);
        await _setDTR(false);
        await _sleep(100);
        await _setRTS(false);
        await _setDTR(true);
        await _sleep(50);
        await _setDTR(false);
        await _sleep(400);
        await _sync();
        _chip = await _detectChip();
        Terminal.log('Connected to ' + _chip, 'success');
        return _chip;
    }

    async function _setRTS(value) {
        if (_port && _port.setSignals) {
            await _port.setSignals({ rts: value });
        }
    }

    async function _setDTR(value) {
        if (_port && _port.setSignals) {
            await _port.setSignals({ dtr: value });
        }
    }

    async function flashBegin(size, offset) {
        var numBlocks = Math.floor((size + ESP_WRITE_SIZE - 1) / ESP_WRITE_SIZE);
        var eraseSize = Math.max(size, numBlocks * ESP_WRITE_SIZE);
        var data = new Uint8Array(16);
        data[0] = eraseSize & 0xff; data[1] = (eraseSize >> 8) & 0xff;
        data[2] = (eraseSize >> 16) & 0xff; data[3] = (eraseSize >> 24) & 0xff;
        data[4] = numBlocks & 0xff; data[5] = (numBlocks >> 8) & 0xff;
        data[6] = (numBlocks >> 16) & 0xff; data[7] = (numBlocks >> 24) & 0xff;
        data[8] = ESP_WRITE_SIZE & 0xff; data[9] = (ESP_WRITE_SIZE >> 8) & 0xff;
        data[10] = (ESP_WRITE_SIZE >> 16) & 0xff; data[11] = (ESP_WRITE_SIZE >> 24) & 0xff;
        data[12] = offset & 0xff; data[13] = (offset >> 8) & 0xff;
        data[14] = (offset >> 16) & 0xff; data[15] = (offset >> 24) & 0xff;
        await _command(ESP_FLASH_BEGIN, data, 0, 3000);
        Terminal.log('Flash erase started (' + eraseSize + ' bytes)', 'info');
    }

    async function flashBlock(data, seq, timeout) {
        var padding = ESP_WRITE_SIZE - data.length;
        if (padding > 0) {
            var padded = new Uint8Array(ESP_WRITE_SIZE);
            padded.set(data);
            for (var i = data.length; i < ESP_WRITE_SIZE; i++) padded[i] = 0xff;
            data = padded;
        }
        var header = new Uint8Array(16);
        header[0] = data.length & 0xff; header[1] = (data.length >> 8) & 0xff;
        header[2] = (data.length >> 16) & 0xff; header[3] = (data.length >> 24) & 0xff;
        header[4] = seq & 0xff; header[5] = (seq >> 8) & 0xff;
        header[6] = (seq >> 16) & 0xff; header[7] = (seq >> 24) & 0xff;
        header[8] = 0; header[9] = 0; header[10] = 0; header[11] = 0;
        var full = new Uint8Array(header.length + data.length);
        full.set(header); full.set(data, header.length);
        var checksum = _calcChecksum(data);
        await _command(ESP_FLASH_DATA, full, checksum, timeout || 3000);
    }

    async function flashEnd(reboot) {
        var data = new Uint8Array(1);
        data[0] = reboot ? 0 : 1;
        try {
            await _command(ESP_FLASH_END, data, 0, 500);
        } catch(e) {}
    }

    async function flashData(binaryData, offset, progressCallback) {
        var totalSize = binaryData.length;
        await flashBegin(totalSize, offset);
        var seq = 0;
        for (var i = 0; i < totalSize; i += ESP_WRITE_SIZE) {
            var chunk = binaryData.slice(i, Math.min(i + ESP_WRITE_SIZE, totalSize));
            await flashBlock(chunk, seq, 3000);
            seq++;
            if (progressCallback) {
                progressCallback(Math.min(i + ESP_WRITE_SIZE, totalSize), totalSize);
            }
        }
        await flashEnd(true);
    }

    async function disconnect() {
        if (_reader) { try { await _reader.cancel(); } catch(e) {} _reader = null; }
        if (_writer) { _writer.releaseLock(); _writer = null; }
        if (_port) { try { await _port.close(); } catch(e) {} _port = null; }
        Terminal.log('Disconnected from ' + (_chip || 'device'), 'info');
    }

    function _sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

    function getChip() { return _chip; }
    function isConnected() { return _port !== null; }

    return {
        connect: connect,
        disconnect: disconnect,
        flashData: flashData,
        flashBegin: flashBegin,
        flashBlock: flashBlock,
        flashEnd: flashEnd,
        getChip: getChip,
        isConnected: isConnected
    };
})();
