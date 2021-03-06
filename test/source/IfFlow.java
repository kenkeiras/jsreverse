class IfFlow {


    public int int_eq(int intp_1, int intp_2) {
        if (intp_1 == intp_2){
            return 1;
        }
        return 0;
    }

    public int int_lt(int intp_1, int intp_2) {
        if (intp_1 < intp_2){
            return 1;
        }
        return 0;
    }

    public int int_le(int intp_1, int intp_2) {
        if (intp_1 <= intp_2){
            return 1;
        }
        return 0;
    }

    public int int_gt(int intp_1, int intp_2) {
        if (intp_1 > intp_2){
            return 1;
        }
        return 0;
    }

    public int int_ge(int intp_1, int intp_2) {
        if (intp_1 >= intp_2){
            return 1;
        }
        return 0;
    }

    public int int_sum(int intp_1, int intp_2) {
        if ((intp_1 + intp_2) > 0){
            ++intp_1;
            return intp_1;
        }
        return 0;
    }

    public int nested_int(int intp_1, int intp_2, int intp_3) {
        if (intp_1 > intp_2){
            if (intp_1 > intp_3){
                return intp_1;
            }
            return intp_3;
        }
        if (intp_2 > intp_3){
            return intp_2;
        }
        return intp_3;
    }

}
