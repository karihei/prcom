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
     *   comments: Object.<hubreview.Unreader.CommentModel>
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
     */
    hubreview.Unreader.prototype.run = function() {
        var self = this;
        $('.comment').each(function() {
            var id = this.id;
            var comments = self.getComments_();

            if (id.match(/^(r|issuecomment-|commitcomment-)\d+/)) {
                self.addUnreadClass_($(this), comments[id], id);
            } else if (id.match(/^discussion_(r\d+)/)) {
                // ID:discussion_r1234 と r1234 は同じコメントを指すため、
                // r1234側で既に未読管理がされている場合はdiscussion_r1234も
                // ステータスをそれに合わせる。
                var pareId = id.match(/^discussion_(r\d+)/)[1];
                var c = self.getComment_(pareId);
                if (c) {
                    self.addUnreadClass_($(this), c, pareId);
                } else {
                    self.addUnreadClass_($(this), comments[pareId], pareId);
                }
                id = pareId;
            }

            // 一定時間hoverされたら既読にする
            $(this).hover(function() {
                var el = $(this);
                var t = setTimeout(function() {
                    var com = self.getComments_()[id];
                    if (com && !com.fixedUnread) {
                        self.unread_(id, el, false);
                    }
                }, 700);
                $(this).data('timeout', t);
            }, function() {
                clearTimeout($(this).data('timeout'));
            });
        });
    };

    /**
     * @param {Element} el
     * @param {hubreview.Unreader.CommentModel} comment
     * @param {string} commentIdStr
     * @private
     */
    hubreview.Unreader.prototype.addUnreadClass_ = function(el, comment, commentIdStr) {
        if (comment && comment.isUnread) {
            $(el).addClass('hubreview-unread-comment');
        } else if (!comment) {
            this.addComment_({commentId: commentIdStr, isUnread: true});
            $(el).addClass('hubreview-unread-comment');
        }
        var unreadButton = this.createUnreadButton_(commentIdStr, el);
        $('.comment-header', el).append(unreadButton);
    };

    /**
     * @param {string} commentId
     * @param {Element} el
     * @private
     * @return {Element}
     */
    hubreview.Unreader.prototype.createUnreadButton_ = function(commentId, el) {
        var buttonEl = $('<span/>').addClass('hubreview-unread-button');
        var checkEl = $('<input/>').attr('type', 'checkbox').addClass('hubreview-unread-check').attr('id', 'hubreview-unread-' + commentId);
        var labelEl = $('<label/>').addClass('hubreview-unread-label').text('keep!').attr('for', 'hubreview-unread-' + commentId);
        buttonEl.append(checkEl);
        buttonEl.append(labelEl);
        var com = this.getComment_(commentId);
        if (com && com.fixedUnread) {
            $(checkEl).attr('checked', true);
            $(labelEl).addClass('keep');
        }

        var self = this;
        checkEl.click(function(evt) {
            var com = self.getComment_(commentId);
            if (com && !com.isUnread) {
                self.unread_(commentId, el, true, true);
                $(labelEl).addClass('keep');
            } else if (com && com.isUnread) {
                self.unread_(commentId, el, false, false);
                $(labelEl).removeClass('keep');
            }
            evt.stopPropagation();
        });
        return buttonEl;
    };

    /**
     * @param {string} commentId
     * @param {Element} el
     * @param {boolean} isUnread
     * @param {boolean} opt_fixedUnread ホバーで既読にしない
     * @private
     * @return {Element}
     */
    hubreview.Unreader.prototype.unread_ = function(commentId, el, isUnread, opt_fixedUnread) {
        this.addComment_({commentId: commentId, isUnread: isUnread, fixedUnread: opt_fixedUnread});
        if (isUnread) {
            $(el).addClass('hubreview-unread-comment');
        } else {
            $(el).removeClass('hubreview-unread-comment');
        }
    };

    /**
     * @param {Object.<hubreview.Unreader.CommentModel>} comment
     * @private
     */
    hubreview.Unreader.prototype.addComment_ = function(comment) {
        var comments = this.getComments_();
        comments[comment.commentId] = comment;
        this.setValue_('comments', comments);
    };

    /**
     * @return {Object.<hubreview.Unreader.CommentModel>}
     * @private
     */
    hubreview.Unreader.prototype.getComments_ = function(callback) {
        chrome.extension.sendRequest({'action': 'getComments', 'pullId': this.pullId_},
            function(comments) {
                debugger;
            });
        return this.getValue_('comments') || {};
    };

    /**
     * @return {hubreview.Unreader.CommentModel}
     * @private
     */
    hubreview.Unreader.prototype.getComment_ = function(commentId) {
        var comments = this.getValue_('comments') || {};
        return comments[commentId];
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
