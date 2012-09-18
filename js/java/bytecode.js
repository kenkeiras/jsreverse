// Opcode: (mnemonic, params, stack_in, stack_out)
var OPCODES = {

    // Constants
    0x00: ["nop", [], [], []],
    0x01: ["aconst_null", [], [], ["null"]],
    0x02: ["iconst_m1", [], [], ["int"]],
    0x03: ["iconst_0", [], [], ["int"]],
    0x04: ["iconst_1", [], [], ["int"]],
    0x05: ["iconst_2", [], [], ["int"]],
    0x06: ["iconst_3", [], [], ["int"]],
    0x07: ["iconst_4", [], [], ["int"]],
    0x08: ["iconst_5", [], [], ["int"]],
    0x09: ["lconst_0", [], [], ["long"]],
    0x0a: ["lconst_1", [], [], ["long"]],
    0x0b: ["fconst_0", [], [], ["float"]],
    0x0c: ["fconst_1", [], [], ["float"]],
    0x0d: ["fconst_2", [], [], ["float"]],
    0x0e: ["dconst_0", [], [], ["double"]],
    0x0f: ["dconst_1", [], [], ["double"]],
    0x10: ["bipush", ["byte"], [], ["value"]],
    0x11: ["sipush", ["byte1", "byte2"], [], ["value"]],
    0x12: ["ldc", ["byte"], [], ["value"]],
    0x13: ["ldc_w", ["indexbyte1", "indexbyte2"], [], ["value"]],
    0x14: ["ldc2_w", ["indexbyte1", "indexbyte2"], [], ["value"]],

    // Loads
    0x15: ["iload", ["int"], [], ["value"]],
    0x16: ["lload", ["long"], [], ["value"]],
    0x17: ["fload", ["float"], [], ["value"]],
    0x18: ["dload", ["double"], [], ["value"]],
    0x19: ["aload", ["reference"], [], ["objectref"]],
    0x1a: ["iload_0", [], [], ["value"]],
    0x1b: ["iload_1", [], [], ["value"]],
    0x1c: ["iload_2", [], [], ["value"]],
    0x1d: ["iload_3", [], [], ["value"]],
    0x1e: ["lload_0", [], [], ["value"]],
    0x1f: ["lload_1", [], [], ["value"]],
    0x20: ["lload_2", [], [], ["value"]],
    0x21: ["lload_3", [], [], ["value"]],
    0x22: ["fload_0", [], [], ["value"]],
    0x23: ["fload_1", [], [], ["value"]],
    0x24: ["fload_2", [], [], ["value"]],
    0x25: ["fload_3", [], [], ["value"]],
    0x26: ["dload_0", [], [], ["value"]],
    0x27: ["dload_1", [], [], ["value"]],
    0x28: ["dload_2", [], [], ["value"]],
    0x29: ["dload_3", [], [], ["value"]],
    0x2a: ["aload_0", [], [], ["objectref"]],
    0x2b: ["aload_1", [], [], ["objectref"]],
    0x2c: ["aload_2", [], [], ["objectref"]],
    0x2d: ["aload_3", [], [], ["objectref"]],
    0x2e: ["iaload", [], ["arrayref", "int"], ["value"]],
    0x2f: ["laload", [], ["arrayref", "int"], ["value"]],
    0x30: ["faload", [], ["arrayref", "int"], ["value"]],
    0x31: ["daload", [], ["arrayref", "int"], ["value"]],
    0x32: ["aaload", [], ["arrayref", "int"], ["value"]],
    0x33: ["baload", [], ["arrayref", "int"], ["value"]],
    0x34: ["caload", [], ["arrayref", "int"], ["value"]],
    0x35: ["saload", [], ["arrayref", "int"], ["value"]],


    // Stores
    0x36: ["istore", ["byte"], ["value"], []],
    0x37: ["lstore", ["byte"], ["value"], []],
    0x38: ["fstore", ["byte"], ["value"], []],
    0x39: ["dstore", ["byte"], ["value"], []],
    0x3a: ["astore", ["byte"], ["objectref"], []],
    0x3b: ["istore_0", [], ["value"], []],
    0x3c: ["istore_1", [], ["value"], []],
    0x3d: ["istore_2", [], ["value"], []],
    0x3e: ["istore_3", [], ["value"], []],
    0x3f: ["lstore_0", [], ["value"], []],
    0x40: ["lstore_1", [], ["value"], []],
    0x41: ["lstore_2", [], ["value"], []],
    0x42: ["lstore_3", [], ["value"], []],
    0x43: ["fstore_0", [], ["value"], []],
    0x44: ["fstore_1", [], ["value"], []],
    0x45: ["fstore_2", [], ["value"], []],
    0x46: ["fstore_3", [], ["value"], []],
    0x47: ["dstore_0", [], ["value"], []],
    0x48: ["dstore_1", [], ["value"], []],
    0x49: ["dstore_2", [], ["value"], []],
    0x4a: ["dstore_3", [], ["value"], []],
    0x4b: ["astore_0", [], ["objectref"], []],
    0x4c: ["astore_1", [], ["objectref"], []],
    0x4d: ["astore_2", [], ["objectref"], []],
    0x4e: ["astore_3", [], ["objectref"], []],
    0x4f: ["iastore", [], ["arrayref", "int", "value"], []],
    0x50: ["lastore", [], ["arrayref", "int", "value"], []],
    0x51: ["fastore", [], ["arrayref", "int", "value"], []],
    0x52: ["dastore", [], ["arrayref", "int", "value"], []],
    0x53: ["aastore", [], ["arrayref", "int", "value"], []],
    0x54: ["bastore", [], ["arrayref", "int", "value"], []],
    0x55: ["castore", [], ["arrayref", "int", "value"], []],
    0x56: ["sastore", [], ["arrayref", "int", "value"], []],


    // Stack
    0x57: ["pop", [], ["value"], []],
    0x58: ["pop2", [], ["value1", "value2"], []],
    0x59: ["dup", [], ["value"], ["value", "value"]],
    0x5a: ["dup_x1", [], ["value2", "value1"], ["value1", "value2", "value1"]],

    // Check from http://docs.oracle.com/javase/specs/jvms/se7/html/jvms-6.html//jvms-6.5.dup_x2
    0x5b: ["dup_x2", [], ["value3", "value2", "value1"], ["value1", "value3", "value2", "value1"]],
    0x5c: ["dup2", [], ["value2", "value1"], ["value2", "value1", "value2", "value1"]],
    0x5d: ["dup2_x1", [], ["value3", "value2", "value1"], ["value2", "value1", "value3", "value2", "value1"]],
    0x5e: ["dup2_x2", [], ["value4", "value3", "value2", "value1"], ["value2", "value1", "value4", "value3", "value2", "value1"]],

    0x5f: ["swap", [], ["value1", "value2"], ["value2", "value1"]],


    // Math
    0x60: ["iadd", [], ["value1", "value2"], ["result"]],
    0x61: ["ladd", [], ["value1", "value2"], ["result"]],
    0x62: ["fadd", [], ["value1", "value2"], ["result"]],
    0x63: ["dadd", [], ["value1", "value2"], ["result"]],
    0x64: ["isub", [], ["value1", "value2"], ["result"]],
    0x65: ["lsub", [], ["value1", "value2"], ["result"]],
    0x66: ["fsub", [], ["value1", "value2"], ["result"]],
    0x67: ["dsub", [], ["value1", "value2"], ["result"]],
    0x68: ["imul", [], ["value1", "value2"], ["result"]],
    0x69: ["lmul", [], ["value1", "value2"], ["result"]],
    0x6a: ["fmul", [], ["value1", "value2"], ["result"]],
    0x6b: ["dmul", [], ["value1", "value2"], ["result"]],
    0x6c: ["idiv", [], ["value1", "value2"], ["result"]],
    0x6d: ["ldiv", [], ["value1", "value2"], ["result"]],
    0x6e: ["fdiv", [], ["value1", "value2"], ["result"]],
    0x6f: ["ddiv", [], ["value1", "value2"], ["result"]],
    0x70: ["irem", [], ["value1", "value2"], ["result"]],
    0x71: ["lrem", [], ["value1", "value2"], ["result"]],
    0x72: ["frem", [], ["value1", "value2"], ["result"]],
    0x73: ["drem", [], ["value1", "value2"], ["result"]],
    0x74: ["ineg", [], ["value"], ["result"]],
    0x75: ["lneg", [], ["value"], ["result"]],
    0x76: ["fneg", [], ["value"], ["result"]],
    0x77: ["dneg", [], ["value"], ["result"]],
    0x78: ["ishl", [], ["value1", "value2"], ["result"]],
    0x79: ["lshl", [], ["value1", "value2"], ["result"]],
    0x7a: ["ishr", [], ["value1", "value2"], ["result"]],
    0x7b: ["lshr", [], ["value1", "value2"], ["result"]],
    0x7c: ["iushr", [], ["value1", "value2"], ["result"]],
    0x7d: ["lushr", [], ["value1", "value2"], ["result"]],
    0x7e: ["iand", [], ["value1", "value2"], ["result"]],
    0x7f: ["land", [], ["value1", "value2"], ["result"]],
    0x80: ["ior", [], ["value1", "value2"], ["result"]],
    0x81: ["lor", [], ["value1", "value2"], ["result"]],
    0x82: ["ixor", [], ["value1", "value2"], ["result"]],
    0x83: ["lxor", [], ["value1", "value2"], ["result"]],
    0x84: ["iinc", ["int", "const"], [], []],

    // Conversions
    0x85: ["i2l", [], ["value"], ["result"]],
    0x86: ["i2f", [], ["value"], ["result"]],
    0x87: ["i2d", [], ["value"], ["result"]],
    0x88: ["l2i", [], ["value"], ["result"]],
    0x89: ["l2f", [], ["value"], ["result"]],
    0x8a: ["l2d", [], ["value"], ["result"]],
    0x8b: ["f2i", [], ["value"], ["result"]],
    0x8c: ["f2l", [], ["value"], ["result"]],
    0x8d: ["f2d", [], ["value"], ["result"]],
    0x8e: ["d2i", [], ["value"], ["result"]],
    0x8f: ["d2l", [], ["value"], ["result"]],
    0x90: ["d2f", [], ["value"], ["result"]],
    0x91: ["i2b", [], ["value"], ["result"]],
    0x92: ["i2c", [], ["value"], ["result"]],
    0x93: ["i2s", [], ["value"], ["result"]],



    // Comparisons
    0x94: ["lcmp", [], ["value1", "value2"], ["result"]],
    0x95: ["fcmpl", [], ["value1", "value2"], ["result"]],
    0x96: ["fcmpg", [], ["value1", "value2"], ["result"]],
    0x97: ["dcmpl", [], ["value1", "value2"], ["result"]],
    0x98: ["dcmpg", [], ["value1", "value2"], ["result"]],
    0x99: ["ifeq", ["branchbyte1", "branchbyte2"], ["value"], []],
    0x9a: ["ifne", ["branchbyte1", "branchbyte2"], ["value"], []],
    0x9b: ["iflt", ["branchbyte1", "branchbyte2"], ["value"], []],
    0x9c: ["ifge", ["branchbyte1", "branchbyte2"], ["value"], []],
    0x9d: ["ifgt", ["branchbyte1", "branchbyte2"], ["value"], []],
    0x9e: ["ifle", ["branchbyte1", "branchbyte2"], ["value"], []],
    0x9f: ["if_icmpeq", ["branchbyte1", "branchbyte2"], ["value1", "value2"], []],
    0xa0: ["if_icmpne", ["branchbyte1", "branchbyte2"], ["value1", "value2"], []],
    0xa1: ["if_icmplt", ["branchbyte1", "branchbyte2"], ["value1", "value2"], []],
    0xa2: ["if_icmpge", ["branchbyte1", "branchbyte2"], ["value1", "value2"], []],
    0xa3: ["if_icmpgt", ["branchbyte1", "branchbyte2"], ["value1", "value2"], []],
    0xa4: ["if_icmple", ["branchbyte1", "branchbyte2"], ["value1", "value2"], []],
    0xa5: ["if_acmpeq", ["branchbyte1", "branchbyte2"], ["value1", "value2"], []],
    0xa6: ["if_acmpne", ["branchbyte1", "branchbyte2"], ["value1", "value2"], []],


    // Control
    0xa7: ["goto", ["branchbyte1", "branchbyte2"], [], []],
    0xa8: ["jsr", ["branchbyte1", "branchbyte2"], [], ["address"]],
    0xa9: ["ret", ["byte"], [], []],
    0xaa: ["tableswitch", ["padding", "defaultbyte1", "defaultbyte2", "defaultbyte3", "defaultbyte4",
                           "lowbyte1", "lowbyte2", "lowbyte3", "lowbyte4",
                           "highbyte1", "highbyte2", "highbyte3", "highbyte4", "jump-offsets"], ["int"], []],

    0xab: ["lookupswitch", ["padding", "defaultbyte1", "defaultbyte2", "defaultbyte3", "defaultbyte4",
                            "npairs1", "npairs2", "npairs3", "npairs4", "match-offset"], ["key"], []],
    0xac: ["ireturn", [], ["value"], []],
    0xad: ["lreturn", [], ["value"], []],
    0xae: ["freturn", [], ["value"], []],
    0xaf: ["dreturn", [], ["value"], []],
    0xb0: ["areturn", [], ["objectref"], []],
    0xb1: ["return", [], [], []],


    // References
    0xb2: ["getstatic", ["indexbyte1", "indexbyte2"], [], ["value"]],
    0xb3: ["putstatic", ["indexbyte1", "indexbyte2"], ["value"], []],
    0xb4: ["getfield", ["indexbyte1", "indexbyte2"], ["objectref"], ["value"]],
    0xb5: ["putfield", ["indexbyte1", "indexbyte2"], ["objectref", "value"], []],
    0xb6: ["invokevirtual", ["indexbyte1", "indexbyte2"], ["objectref"], []],
    0xb7: ["invokespecial", ["indexbyte1", "indexbyte2"], ["objectref"], []],
    0xb8: ["invokestatic", ["indexbyte1", "indexbyte2"], [], []],
    0xb9: ["invokeinterface", ["indexbyte1", "indexbyte2", "count", 0], ["objectref"], []],
    0xba: ["invokedynamic", ["indexbyte1", "indexbyte2", 0, 0], [], []],
    0xbb: ["new", ["indexbyte1", "indexbyte2"], [], ["objectref"]],
    0xbc: ["newarray", ["atype"], ["count"], ["arrayref"]],
    0xbd: ["anewarray", ["indexbyte1", "indexbyte2"], ["count"], ["arrayref"]],
    0xbe: ["arraylength", [], ["arrayref"], ["length"]],
    0xbf: ["athrow", [], ["objectref"], ["objectref"]],
    0xc0: ["checkcast", ["indexbyte1", "indexbyte2"], ["objectref"], ["objectref"]],
    0xc1: ["instanceof", ["indexbyte1", "indexbyte2"], ["objectref"], ["result"]],
    0xc2: ["monitorenter", [], ["objectref"], []],
    0xc3: ["monitorexit", [], ["objectref"], []],


    // Extended
    // Uh... http://docs.oracle.com/javase/specs/jvms/se7/html/jvms-6.html//jvms-6.5.wide
    0xc4: ["wide", ["opcode", "indexbyte1", "indexbyte2"], [], []],
    0xc5: ["multianewarray", ["indexbyte1", "indexbyte2", "dimensions"], ["count1"], ["arrayref"]],
    0xc6: ["ifnull", ["branchbyte1", "branchbyte2"], ["value"], []],
    0xc7: ["ifnonnull", ["branchbyte1", "branchbyte2"], ["value"], []],
    0xc8: ["goto_w", ["branchbyte1", "branchbyte2", "branchbyte3", "branchbyte4"], [], []],
    0xc9: ["jsr_w", ["branchbyte1", "branchbyte2", "branchbyte3", "branchbyte4"], [], ["address"]],


    // Reserved [not implemented]
    0xca: ["breakpoint", [], [], []],
    0xfe: ["impdep1", [], [], []],
    0xff: ["impdep2", [], [], []],
};

function get_java_type_length(t, op){
    var constant_length = {
        opcode: 1,
        int: 4,
        float: 4,
        double: 8,
        byte: 1,
    };

    if (constant_length[t] !== undefined){
        return constant_length[t];
    }

    if (t.indexOf("byte") !== -1){
        return 1;
    }

    //raise Exception('Type "%s" unknown' % t)
}

function java_opcode_length(op){
    var length = 1;
    for(var i = 0;(t = op[1][i]) !== undefined; i++){
        length += get_java_type_length(t, op);
    }
    return length;
}
