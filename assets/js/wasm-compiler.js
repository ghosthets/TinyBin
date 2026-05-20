var WasmCompiler = (function() {
    'use strict';
    var wasmReady = false;
    var wasmModule = null;
    var wasmInstance = null;
    var wasmMemory = null;
    var loading = false;
    var loadError = null;

    async function init() {
        if (loading) return;
        loading = true;
        try {
            var wasmUrl = 'assets/wasm/tcc.wasm';
            var resp = await fetch(wasmUrl);
            if (!resp.ok) {
                loadError = 'WASM compiler not available (HTTP ' + resp.status + ')';
                loading = false;
                return;
            }
            var wasmBytes = await resp.arrayBuffer();
            var importObject = {
                env: {
                    memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
                    abort: function() { Terminal.log('WASM compiler aborted', 'error'); },
                    print: function(ptr) {
                        var str = readString(ptr);
                        if (str) Terminal.log('[WASM] ' + str, 'info');
                    },
                    printErr: function(ptr) {
                        var str = readString(ptr);
                        if (str) Terminal.log('[WASM] ' + str, 'error');
                    },
                    mmap: function() { return 0; },
                    munmap: function() { return 0; },
                }
            };
            wasmMemory = importObject.env.memory;
            var result = await WebAssembly.instantiate(wasmBytes, importObject);
            wasmModule = result.module;
            wasmInstance = result.instance;
            wasmReady = true;
            loading = false;
            Terminal.log('WASM C compiler loaded successfully', 'success');
        } catch(e) {
            loadError = 'WASM compiler load failed: ' + e.message;
            loading = false;
            Terminal.log('WASM compiler unavailable: ' + e.message, 'warning');
            Terminal.log('Falling back to server-side compilation only', 'info');
        }
    }

    function readString(ptr) {
        if (!wasmMemory) return null;
        var mem = new Uint8Array(wasmMemory.buffer);
        var str = '';
        for (var i = ptr; mem[i] !== 0; i++) {
            str += String.fromCharCode(mem[i]);
        }
        return str;
    }

    function writeString(ptr, str) {
        if (!wasmMemory) return;
        var mem = new Uint8Array(wasmMemory.buffer);
        for (var i = 0; i < str.length; i++) {
            mem[ptr + i] = str.charCodeAt(i);
        }
        mem[ptr + str.length] = 0;
    }

    async function compile(sourceCode, board) {
        if (!wasmReady) {
            return {
                success: false,
                toolchain_missing: true,
                message: 'WASM compiler not loaded. Use server-side compilation.',
                log: [{ type: 'error', message: 'WASM compiler not available: ' + (loadError || 'Not initialized') }],
                problems: []
            };
        }

        Terminal.log('Compiling with WASM C compiler...', 'info');
        try {
            var tccCompile = wasmInstance.exports.tcc_compile;
            var tccGetError = wasmInstance.exports.tcc_get_error;
            var tccOutputFile = wasmInstance.exports.tcc_output_file;
            var tccDelete = wasmInstance.exports.tcc_delete;
            var tccNew = wasmInstance.exports.tcc_new;
            var tccAddInclude = wasmInstance.exports.tcc_add_include_path;
            var tccAddLibrary = wasmInstance.exports.tcc_add_library_path;

            if (!tccNew || !tccCompile) {
                throw new Error('WASM module missing required exports');
            }

            var state = tccNew();
            if (!state) throw new Error('Failed to create TCC state');

            var srcPtr = wasmInstance.exports.malloc(sourceCode.length + 1);
            writeString(srcPtr, sourceCode);

            var ret = tccCompile(state, srcPtr, sourceCode.length);
            wasmInstance.exports.free(srcPtr);

            if (ret !== 0) {
                var errPtr = tccGetError(state);
                var errMsg = errPtr ? readString(errPtr) : 'Compilation failed';
                tccDelete(state);
                return {
                    success: false,
                    message: errMsg,
                    log: [{ type: 'error', message: errMsg }],
                    problems: parseWasmErrors(errMsg)
                };
            }

            var outPtr = wasmInstance.exports.malloc(64);
            var outPath = '/tmp/output.bin';
            writeString(outPtr, outPath);
            ret = tccOutputFile(state, outPtr);
            wasmInstance.exports.free(outPtr);

            if (ret !== 0) {
                tccDelete(state);
                return {
                    success: false,
                    message: 'Failed to generate binary',
                    log: [{ type: 'error', message: 'tcc_output_file returned ' + ret }],
                    problems: []
                };
            }

            var binarySize = wasmInstance.exports.get_output_size(state);
            var binaryPtr = wasmInstance.exports.get_output_ptr(state);
            var mem = new Uint8Array(wasmMemory.buffer);
            var binary = new Uint8Array(binarySize);
            binary.set(mem.subarray(binaryPtr, binaryPtr + binarySize));

            tccDelete(state);

            return {
                success: true,
                message: 'WASM compilation successful',
                log: [{ type: 'success', message: 'WASM compile OK' }, { type: 'info', message: 'Binary: ' + binarySize + ' bytes' }],
                problems: [],
                data: {
                    binary_name: 'firmware_wasm.bin',
                    binary_size: binarySize,
                    binary_data: binary
                }
            };
        } catch(e) {
            return {
                success: false,
                message: 'WASM compilation error: ' + e.message,
                log: [{ type: 'error', message: e.message }],
                problems: []
            };
        }
    }

    function parseWasmErrors(errMsg) {
        var problems = [];
        var lines = errMsg.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line) continue;
            var match = line.match(/:(\d+):\s*(error|warning):\s*(.*)/);
            if (match) {
                problems.push({
                    type: match[2],
                    message: match[3],
                    line: parseInt(match[1]),
                    file: ''
                });
            } else if (line.indexOf('error') !== -1 || line.indexOf('warning') !== -1) {
                problems.push({
                    type: line.indexOf('error') !== -1 ? 'error' : 'warning',
                    message: line,
                    line: 0,
                    file: ''
                });
            }
        }
        return problems;
    }

    function isReady() { return wasmReady; }
    function isLoading() { return loading; }
    function getError() { return loadError; }

    return {
        init: init,
        compile: compile,
        isReady: isReady,
        isLoading: isLoading,
        getError: getError
    };
})();
