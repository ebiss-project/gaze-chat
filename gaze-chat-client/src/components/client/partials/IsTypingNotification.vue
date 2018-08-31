<style>
.is-typing-container {
    height: 25px;
    font-size: 16px;
}
.is-typing-container span {
    display: none;
    opacity: 0;
}
</style>

<template>
    <div class="is-typing-container">
        <template v-for="(u, index) in typingStatusList">
            <template v-if="index != uid">
                <span :ref="'is-typing-notification-'+userList[index].uid" :id="'is-typing-notification-'+userList[index].uid">{{ userList[index].username }} is typing ...
                    <i class="fa fa-pencil" aria-hidden="true"></i>&nbsp;</span>
            </template>
        </template>
    </div>
</template>

<script>
import anime from "animejs";

export default {
    created: function() {
        this.updatetypingStatusListList(this.userList);
    },
    props: ["userList", "uid"],
    watch: {
        userList: function(value) {
            this.updatetypingStatusListList(value);
        }
    },
    data() {
        return {
            typingStatusList: {}
        };
    },
    methods: {
        getActiveUserDisplayCounter: function() {
            var active = 0;
            for (var key in this.typingStatusList) {
                if (this.typingStatusList[key].typing) active++;
            }
            return active;
        },
        signalUid: function(uid) {
            if (uid == this.uid) {
                return;
            }
            if (this.typingStatusList[uid] == undefined) {
                console.error("signalUid for unknown uid ", uid);
                return;
            }
            let el = this;
            this.typingStatusList[uid].signalCount++;
            this.typingStatusList[uid].typing = true;

            if (this.typingStatusList[uid].fadeOutAnimation != null) this.typingStatusList[uid].fadeOutAnimation.pause();

            this.$refs["is-typing-notification-" + uid][0].style.display = "inline";
            this.$refs["is-typing-notification-" + uid][0].style.opacity = "1.0";

            // Animate FadeOut
            clearTimeout(this.typingStatusList[uid].fadeOutTimer);
            this.typingStatusList[uid].fadeOutTimer = setTimeout(function() {
                el.typingStatusList[uid].typing = false;
                el.typingStatusList[uid].fadeOutAnimation = anime({
                    targets: el.$refs["is-typing-notification-" + uid][0],
                    opacity: 0,
                    duration: 500,
                    easing: "linear",
                    complete: function() {
                        el.$refs["is-typing-notification-" + uid][0].style.display = "none";
                    }
                });
            }, 2500);
        },
        interruptUid: function(uid) {
            if (uid == this.uid) {
                return;
            }
            if (this.typingStatusList[uid] == undefined) {
                console.error("signalUid for unknown uid ", uid);
                return;
            }

            if (this.typingStatusList[uid].fadeOutAnimation != null) this.typingStatusList[uid].fadeOutAnimation.pause();

            this.typingStatusList[uid].signalCount = 0;
            this.typingStatusList[uid].typing = false;
            clearTimeout(this.typingStatusList[uid].fadeOutTimer);

            this.$refs["is-typing-notification-" + uid][0].style.display = "none";
            this.$refs["is-typing-notification-" + uid][0].style.opacity = "0";
        },
        updatetypingStatusListList: function(value) {
            this.typingStatusList = {};
            for (var u in value) {
                this.$set(this.typingStatusList, u, {
                    uid: u,
                    typing: false,
                    signalCount: 0,
                    fadeOutTimer: null,
                    fadeOutAnimation: null
                });
            }
        }
    }
};
</script>