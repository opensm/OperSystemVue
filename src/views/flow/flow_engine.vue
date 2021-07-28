<template>
  <div class="app-container">
    <el-button type="primary" :disabled="post === false" @click="handleAddData">添加</el-button>

    <el-table :data="flowEngineList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="" width="220">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色名称" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="描述">
        <template slot-scope="scope">
          {{ scope.row.desc }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" :disabled=" ! scope.row.button.includes('PUT')" @click="handleEdit(scope)">修改</el-button>
          <el-button type="danger" size="small" :disabled=" ! scope.row.button.includes('DELETE')" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑审批流程':'新增审批流程'">
      <el-form :model="flowEngine" label-width="80px" label-position="left">
        <el-form-item label="流程名称">
          <el-input v-model="flowEngine.name" placeholder="请输入流程名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="flowEngine.desc"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="备注"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getFlowEngines, addFlowEngine, updateFlowEngine, deleteFlowEngine } from '@/api/flow_engine'
const defaultFlowEngine = {
  id: '',
  name: '',
  desc: ''
}
export default {
  data() {
    return {
      flowEngine: Object.assign({}, defaultFlowEngine),
      flowEngineList: [],
      post: false,
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getFlowEngines()
  },
  methods: {
    getFlowEngines() {
      getFlowEngines().then(response => {
        const { data, meta } = response
        this.flowEngineList = data
        this.post = meta.post_tag
      })
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    handleAddData() {
      this.flowEngine = Object.assign({}, defaultFlowEngine)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.flowEngine = deepClone(scope.row)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('Confirm to remove the role?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await deleteFlowEngine(row.id)
          this.rolesList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.getFlowEngines()
        })
        .catch(err => { console.error(err) })
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await updateFlowEngine(this.flowEngine.id, this.flowEngine)
        for (let index = 0; index < this.flowEngineList.length; index++) {
          if (this.flowEngineList[index].id === this.flowEngine.id) {
            this.flowEngineList.splice(index, 1, Object.assign({}, this.role))
            break
          }
        }
      } else {
        const { data } = await addFlowEngine(this.flowEngine)
        this.flowEngine.id = data.id
        this.flowEngineList.push(this.flowEngine)
      }
      const { desc, id, name } = this.flowEngine
      this.dialogVisible = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>流程ID: ${id}</div>
            <div>流程名称: ${name}</div>
            <div>描述: ${desc}</div>
`,
        type: 'success'
      })
      this.getFlowEngines()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
