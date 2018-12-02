
// https://www.cnblogs.com/yeminglong/p/6249077.html
function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form 
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form 
        var r;

        // rfc4122 requires these characters 
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as 
        // per rfc4122, sec. 4.1.5 
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}

function getUUID() {
    return uuid(32, 36)
}

class TreeNode {

    constructor(data) {
        for (var k in data) {
            this[k] = data[k];
        }

        // this.parent = null; // parent属性不被枚举防止序列化的时候循环引用
        Object.defineProperty(this, 'parent', {
            value: null,
            writable: true,
            enumerable: false,
            configurable: true,
        });

        this.isRoot = !!this.isRoot;
        this.dragDisabled = !!this.dragDisabled;
        this.id = this.id || getUUID();
        this.name = this.name || ("New Node XXX");
        this.children = [];

        if (Array.isArray(data.children) && data.children.length > 0) {
            this.isLeaf = false;
            for (const child of data.children) {
                this.addChildren(new TreeNode(child));
            }
        }
        this.isLeaf = !!this.isLeaf;
    }

    changeName(name) {
        this.name = name
    }

    addChildren(children) {
        if (Array.isArray(children)) {
            for (let i = 0, len = children.length; i < len; i++) {
                const child = children[i]
                child.parent = this
            }
            this.children = this.children.concat(children);
        } else {
            const child = children
            child.parent = this
            this.children.push(child)
        }
    }

    // remove self
    remove() {
        const parent = this.parent;
        parent.removeChild(this);
    }

    // remove child
    removeChild(child) {
        for (var i = 0, len = this.children.length; i < len; i++) {
            if (this.children[i] === child) {
                this.children.splice(i, 1)
                break
            }
        }
    }

    isChildOf(target) {
        let parent = target.parent
        while (parent) {
            if (parent === this) {
                return true
            }
            parent = parent.parent
        }
        return false
    }

    moveTo(target) {
        if (this.isRoot || this === target) {
            return
        }

        if (this.isChildOf(target)) {// cannot move ancestor to child
            return
        }

        if (target.isLeaf) { // cannot move to leaf node
            return
        }

        this.parent.removeChild(this)
        this.parent = target;
        target.children.unshift(this);
    }

    findChildIndex(child) {
        var index = -1;
        for (let i = 0, len = this.children.length; i < len; i++) {
            if (this.children[i] === child) {
                index = i
                break
            }
        }
        return index;
    }

    isCanAsSiblingOf(target) {
        if (this.isRoot || this === target) {
            return false
        }

        if (this.isChildOf(target)) {// cannot move ancestor to child
            return false
        }
        return true
    }

    insertBefore(target) {
        if (!this.isCanAsSiblingOf(target)) {
            return;
        }

        this.parent.removeChild(this);
        this.parent = target.parent;

        const pos = target.parent.findChildIndex(target)
        target.parent.children.splice(pos, 0, this)
    }
}

export {
    TreeNode
};
