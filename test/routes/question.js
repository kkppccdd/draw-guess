/**
 * New node file
 */
module.exports = {
    setUp: function (callback) {
    	this.guessModule = require("../../routes/question.js");
        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    testCompareAnswerCompletedMatch: function (test) {
    	var result = this.guessModule.compareAnswer("奧特曼在银行下象棋","奧特曼在银行下象棋");
        test.equals(result.message, '完全正确！');
        test.equals(result.similarity, 1.0);
        test.done();
    },
    
    testCompareAnswerOnlyOneCharMatched:function(test){
    	var result = this.guessModule.compareAnswer("奧特曼在银行下象棋","二田日曼金上左右人");
        test.equals(result.message, '总共9个字，你只猜对了1个。');
        test.equals(result.similarity, (1.0/9.0) * 0.5);
        test.done();
    },
    testCompareAnswerOnlyTwoCharMatched:function(test){
    	var result = this.guessModule.compareAnswer("奧特曼在银行下象棋","二田日曼左右奧");
        test.equals(result.message, '总共9个字，你只猜对了2个。');
        test.equals(result.similarity, (2.0/9.0) * 0.5);
        test.done();
    },
    testCompareAnswerAllCharMatchedButSequence:function(test){
    	var result = this.guessModule.compareAnswer("奧特曼在银行下象棋","曼奧象行棋特在银下");
        test.equals(result.message, '总共9个字，你全猜对了，但顺序不对。');
        test.equals(result.similarity, (9.0/9.0) * 0.5);
        test.done();
    },
    testCompareAnswerEnglishOnlyThreeMatched:function(test){
    	var result = this.guessModule.compareAnswer("test","tes");
        test.equals(result.message, '总共4个字，你只猜对了3个。');
        test.equals(result.similarity, (3/4) * 0.5);
        test.done();
    },
    testCompareAnswerAllCharMatchedButSequenceWithDuplicateChar:function(test){
    	var result = this.guessModule.compareAnswer("test","tets");
        test.equals(result.message, '总共4个字，你全猜对了，但顺序不对。');
        test.equals(result.similarity, (4/4) * 0.5);
        test.done();
    }
    
};