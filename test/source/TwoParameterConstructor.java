class TwoParameterConstructor {

    private String str;
    public int num;

    public TwoParameterConstructor(String stringp_1, int intp_2) {
        str = stringp_1;
        num = intp_2;
    }

    public void main(String[] stringsp_1) {
        TwoParameterConstructor twoparameterconstructor_1 = new TwoParameterConstructor("test", 42);
    }

}
