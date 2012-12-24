$(document).ready(function() {
    /**
     * @constructor
     */
    var hubreview = function(){
        this.unreader_ = new hubreview.Unreader();
    };

    /**
     * 最初に呼ばれる
     */
    hubreview.prototype.run = function() {
        this.unreader_.run();
    };


    /**
     * コメントを未読管理するやつ
     * @constructor
     */
    hubreview.Unreader = function() {
        this.pullId_ = this.getPullId_();
    };

    /**
     */
    hubreview.Unreader.prototype.run = function() {
        var self = this;
        $('.repo-collab-comment').each(function() {
            var value = {
                commentId: this.id,
                checked: false
            };
            localStorage.setItem(self.pullId_, value);
        });
    };

    /**
     * @private
     */
    hubreview.Unreader.prototype.getPullId_ = function() {
        return $('.pull-number a').attr('href') || '';
    };

    var rev = new hubreview();
    rev.run();
});
