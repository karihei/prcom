/**
 * @fileOverview github review tool
 * @author karihei
 */
$(document).ready(function() {
    /**
     * @constructor
     */
    var hubreview = function(){
        this.unreader_ = new hubreview.Unreader();
    };

    /**
     */
    hubreview.prototype.run = function() {
        this.unreader_.run();
    };


    /**
     * コメントを未読管理するやつ
     * @constructor
     */
    hubreview.Unreader = function() {
        /**
         * PR識別用ID (e.g. "/karihei/prcom/issues/1" )
         * @type {string}
         * @private
         */
        this.pullId_ = this.getPullId_();
    };

    /**
     * ローカルストレージ {pullId: Object} に対するObjectの部分
     * @typedef {{
     *   comments: Array.<hubreview.Unreader.CommentModel>
     * }}
     */
    hubreview.Unreader.DataModel;

    /**
     * コメントモデル
     * @typedef {{
     *    commentId: string,
     *    isUnread : boolean
     * }}
     */
    hubreview.Unreader.CommentModel;

    /**
     * localstrageのkey prefix
     * @type {string}
     * @private
     */
    hubreview.Unreader.prototype.keyPrefix_ = 'hubkari-';

    /**
     */
    hubreview.Unreader.prototype.run = function() {
        var self = this;
        $('.comment').each(function() {
            var id = this.id;
            // r1234 がコメントIDのはず
            if (id.match(/^r\d+/)) {
                self.addComment_({commentId: id, isUnread: false});
            }
        });
    };

    /**
     * @param {Object.<hubreview.Unreader.CommentModel>} comment
     * @private
     */
    hubreview.Unreader.prototype.addComment_ = function(comment) {
        var comments = this.getValue_('comments') || [];
        var targetIndex = -1;
        var targetComment = $(comments).filter(function(index) {
            targetIndex = index;
            return this.commentId === comment.commentId;
        });

        if (targetComment.length === 0) {
            comments.push(comment);
        } else {
            comments[targetIndex] = comment;
        }

        this.setValue_('comments', comments);
    };

    /**
     *
     * @param {string} key
     * @param {*} value
     * @private
     */
    hubreview.Unreader.prototype.setValue_ = function(key, value) {
        var data = localStorage.getItem(this.pullId_) ;
        var json = data ? JSON.parse(data) : {};
        json[key] = value;
        localStorage.setItem(this.pullId_, JSON.stringify(json));
    };

    /**
     * @param {string} key
     * @return {Object}
     * @private
     */
    hubreview.Unreader.prototype.getValue_ = function(key) {
        var data = localStorage.getItem(this.pullId_);
        var json = data ? JSON.parse(data) : {};
        return json[key];
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
