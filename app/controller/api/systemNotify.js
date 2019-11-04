const _ = require('lodash');

let SystemNotifyController = {

    async getUserNotifys(ctx, app) {

        try {

            let payload = ctx.query;
            let userNotifyList = await ctx.service.systemNotify.find(payload, {
                query: {
                    user: ctx.session.user._id
                },
                populate: [{
                    path: 'notify',
                    select: 'title content _id'
                }]
            });

            ctx.helper.renderSuccess(ctx, {
                data: userNotifyList
            });

        } catch (err) {

            ctx.helper.renderFail(ctx, {
                message: err
            });

        }
    },

    async delUserNotify(ctx, app) {

        try {
            let targetIds = ctx.query.ids;
            if (!checkCurrentId(targetIds)) {
                throw new Error(ctx.__("validate_error_params"));
            } else {

                let ids = targetIds.split(',');
                // 删除消息记录
                for (let i = 0; i < ids.length; i++) {
                    const userNotifyId = ids[i];
                    let userNotifyObj = await ctx.service.systemNotify.item(ctx, {
                        query: {
                            '_id': userNotifyId,
                            user: ctx.session.user._id
                        }
                    })
                    if (!_.isEmpty(userNotifyObj)) {
                        // await ctx.service.announce.removes(ctx, userNotifyObj.notify);
                    }
                }

            }

            await ctx.service.systemNotify.removes(ctx, targetIds);
            ctx.helper.renderSuccess(ctx);

        } catch (err) {

            ctx.helper.renderFail(ctx, {
                message: err
            });
        }
    },


    async setMessageHasRead(ctx, app) {


        try {
            let targetIds = ctx.query.ids;
            let queryObj = {};
            let errMsg = '';
            // 用户只能操作自己的消息
            let userInfo = ctx.session.user || {};
            if (_.isEmpty(userInfo)) {
                throw new Error(ctx.__(ctx.__("validate_error_params")))
            } else {
                queryObj.user = ctx.session.user._id;
            }

            if (targetIds == 'all') {
                queryObj.isRead = true;
            } else {
                if (!checkCurrentId(targetIds)) {
                    errMsg = ctx.__("validate_error_params");
                } else {
                    targetIds = targetIds.split(',');
                }
                if (errMsg) {
                    throw new Error(errMsg);
                }
                queryObj['_id'] = {
                    $in: targetIds
                };
            }

            await ctx.service.systemNotify.updateMany(ctx, targetIds, {
                'isRead': true
            }, queryObj);

            ctx.helper.renderSuccess(ctx);

        } catch (err) {

            ctx.helper.renderFail(ctx, {
                message: err
            });

        }

    }

}

module.exports = SystemNotifyController;