export default {
  methods: {
    regExpTest(value, expression) {
      const regExp = new RegExp(expression);
      return regExp.test(value);
    },
  }
}