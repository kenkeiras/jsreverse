class OverloadedConstructor {

    private String str;
    public int num;

    public OverloadedConstructor(String stringp_1) {
        str = stringp_1;
    }

    public OverloadedConstructor(int intp_1) {
        num = intp_1;
    }

    public OverloadedConstructor(String stringp_1, int intp_2) {
        str = stringp_1;
        num = intp_2;
    }

    public OverloadedConstructor(int intp_1, String stringp_2) {
        str = stringp_2;
        num = intp_1;
    }

    public void main(String[] stringsp_1) {
        OverloadedConstructor overloadedconstructor_1 = new OverloadedConstructor("test");
        OverloadedConstructor overloadedconstructor_2 = new OverloadedConstructor(42);
        OverloadedConstructor overloadedconstructor_3 = new OverloadedConstructor("test", 42);
        OverloadedConstructor overloadedconstructor_4 = new OverloadedConstructor(42, "test");
    }

}
