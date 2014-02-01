class WhileLoop {


    public void while_eq(int intp_1, int intp_2) {
        while (intp_1 == intp_2){
            ++intp_1;
        }
    }

    public void while_lt(int intp_1, int intp_2) {
        while (intp_1 < intp_2){
            ++intp_1;
        }
    }

    public void while_le(int intp_1, int intp_2) {
        while (intp_1 <= intp_2){
            ++intp_1;
        }
    }

    public void while_gt(int intp_1, int intp_2) {
        while (intp_1 > intp_2){
            --intp_1;
        }
    }

    public void while_ge(int intp_1, int intp_2) {
        while (intp_1 >= intp_2){
            --intp_1;
        }
    }

    public void nested_while(int intp_1, int intp_2, int intp_3) {
        while (intp_1 < intp_2){
            while (intp_1 < intp_3){
                ++intp_1;
            }
            --intp_2;
        }
    }

}
