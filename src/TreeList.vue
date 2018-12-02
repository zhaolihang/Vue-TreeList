<template>
  <div :style="treeData.isRoot ? 'margin-top:5px;' : 'margin-left: 15px;'">
    <div>
      <!-- 放置在元素上方的空隙中 -->
      <div
        v-if="!treeData.isRoot"
        @dragenter="dragEnterUp"
        @dragover='dragOverUp'
        @dragleave="dragLeaveUp"
        @drop="dropUp"
        class="vtl-border vtl-up"
        :class="{'vtl-active': isDragEnterUp}"
      >
      </div>

      <!-- 放置在元素身上，元素本身也是可以拖动的 -->
      <div
        :id='treeData.id'
        :draggable="!treeData.dragDisabled"
        @dragstart='dragStart'
        @dragend='dragEnd'
        @dragenter='dragEnter'
        @dragover='dragOver'
        @dragleave='dragLeave'
        @drop='drop'
        @mouseover='mouseOver'
        @mouseout='mouseOut'
        @click.stop='treeData.isRoot ? null : click'
        class="vtl-tree-node"
        :class="{'vtl-active': isDragEnterNode}"
      >
        <span v-if="treeData.children && treeData.children.length > 0">
          <i
            :class="{'el-icon-caret-right':!expanded, 'el-icon-caret-bottom':expanded}"
            @click.prevent.stop="expand"
          >
          </i>
        </span>
        <span v-if="treeData.isLeaf">
          <slot name="leafNodeIcon">
            <i class="el-icon-document"></i>
          </slot>
        </span>
        <span v-else>
          <slot name="treeNodeIcon">
            <i class="el-icon-tickets"></i>
          </slot>
        </span>
        <span v-if="!editable">
          {{treeData.name}}
        </span>
        <input
          v-else
          type="text"
          ref="nodeInput"
          :value="treeData.name"
          @input="updateName"
          @blur="setEditable(false)"
        />
        <span v-show="isHover">
          <span @click.stop.prevent="setEditable(true)">
            <slot name="edit">
              <i class="el-icon-edit-outline"></i>
            </slot>
          </span>
          <span
            v-if="!treeData.isLeaf"
            @click.stop.prevent="addChild()"
          >
            <slot name="addTreeNode">
              <i class="el-icon-circle-plus"></i>
            </slot>
          </span>
          <span @click.stop.prevent="delNode">
            <slot name="delete">
              <i class="el-icon-delete"></i>
            </slot>
          </span>
        </span>

      </div>

    </div>

    <div
      v-if="isFolder"
      v-show="expanded"
    >
      <tree-list
        v-for="childData in treeData.children"
        :treeData="childData"
        :key='childData.id'
      >
      </tree-list>
    </div>

  </div>
</template>

<style>
.vtl-border {
  height: 5px;
}
.vtl-border.vtl-up {
  background-color: transparent;
}
.vtl-border.vtl-active {
  border-bottom: 5px solid blue;
}

.vtl-tree-node.vtl-active {
  outline: 2px solid red;
}
.vtl-tree-node:hover {
  background-color: #f0f0f0;
}
</style>

<script>
import { TreeNode } from "./Tree";
import { addHandler, removeHandler } from "./tools";

const KeyCode = {
  Enter: 13,
  Esc: 27
};

let fromComp = null;

export default {
  name: "tree-list",
  props: ["treeData"],

  data() {
    return {
      isHover: false,
      editable: false,
      isDragEnterUp: false,
      isDragEnterBottom: false,
      isDragEnterNode: false,
      expanded: true
    };
  },

  computed: {
    isFolder() {
      return this.treeData.children && this.treeData.children.length;
    }
  },
  mounted() {
    const vm = this;
    this.keyupHandler = addHandler(window, "keyup", e => {
      if (
        (e.keyCode === KeyCode.Enter || e.keyCode === KeyCode.Esc) &&
        vm.editable
      ) {
        vm.editable = false;
      }
    });
  },
  beforeDestroy() {
    removeHandler(window, "keyup", this.keyupHandler);
  },
  methods: {
    updateName(e) {
      this.treeData.changeName(e.target.value);
    },

    delNode() {
      const vm = this;
      if (window.confirm("确定删除吗?")) {
        vm.treeData.remove();
      }
    },

    setEditable(editable) {
      this.editable = editable;
      if (this.editable) {
        this.$nextTick(() => {
          this.$refs.nodeInput.focus();
        });
      }
    },

    expand() {
      if (this.isFolder) {
        this.expanded = !this.expanded;
      }
    },

    mouseOver(e) {
      this.isHover = true;
    },

    mouseOut(e) {
      this.isHover = false;
    },

    clickItem() {
      // find root Node
      var node = this.$parent;
      while (node && !node._props.treeData.isRoot) {
        node = node.$parent;
      }
      if (node) {
        var clickTreeData = this.treeData;
        node.$emit("clickItem", clickTreeData);
      }
    },

    addChild() {
      this.expanded = true;
      var node = new TreeNode({ isLeaf: false });
      this.treeData.addChildren(node);
    },

    dragStart(e) {
      if (!this.treeData.dragDisabled) {
        fromComp = this;
        e.dataTransfer.effectAllowed = "move";
        return true;
      }
      return false;
    },
    dragEnd(e) {
      fromComp = null;
    },

    dragEnterUp() {
      if (!fromComp) return;
      this.isDragEnterUp = true;
    },
    dragOverUp(e) {
      e.preventDefault();
      return true;
    },
    dragLeaveUp() {
      if (!fromComp) return;
      this.isDragEnterUp = false;
    },
    dropUp() {
      if (!fromComp) return;
      fromComp.treeData.insertBefore(this.treeData);
      this.isDragEnterUp = false;
    },

    dragEnter(e) {
      if (!fromComp) return;
      if (this.treeData.isLeaf) return;
      this.isDragEnterNode = true;
    },
    dragOver(e) {
      e.preventDefault();
      return true;
    },
    dragLeave(e) {
      this.isDragEnterNode = false;
    },
    drop(e) {
      if (!fromComp) return;
      fromComp.treeData.moveTo(this.treeData);
      this.isDragEnterNode = false;
    }
  }
};
</script>