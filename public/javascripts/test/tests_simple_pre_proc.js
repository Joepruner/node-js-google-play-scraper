var expect = require('chai').expect;
var simple_pre_proc_funcs = require('../pre_proc_functions/simple_pre_proc_funcs');

describe('remove_non_ascii_chars()', function () {
    it('should remove non-ascii chars from string', function () {
        //1. ARRANGE
        var s1 = "This app  is so garbage! ";
        var s2 = "This app 😆 is so garbage! 😆😆😂";

        //2. ACT
        s2 = simple_pre_proc_funcs.remove_non_ascii_chars(s2);

        //3. ASSERT
        expect(s1).to.be.equal(s2);
    })
})

describe('is_lt3_words()', function () {
    it('should return true if string is less than 3 words long', function () {
        //1. ARRANGE
        var s1 = "This app gave me an instant headache";
        var s2 = "Hot garbage";

        //2. ACT
        var result1 = simple_pre_proc_funcs.is_lt3_words(s1);
        var result2 = simple_pre_proc_funcs.is_lt3_words(s2);

        //3. ASSERT

        expect(result1).to.be.equal(false);
        expect(result2).to.be.equal(true);
    })
})