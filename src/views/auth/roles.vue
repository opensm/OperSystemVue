<template>
  <div class="app-container">
    <el-button :disabled=" post === 'false' " type="primary" @click="handleAddRole">添加</el-button>

    <el-table :data="rolesList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="角色ID" width="220">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色名称" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="描述">
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑角色':'新增角色'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="角色名称">
          <el-input v-model="role.name" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="数据权限">
          <el-select
            v-model="role.data_permission"
            multiple
            filterable
            default-first-option
            placeholder="请数据权限"
          >
            <el-option
              v-for="item in dataPermission"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.desc"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="备注"
          />
        </el-form-item>
        <el-form-item label="关联菜单">
          <el-tree
            ref="tree"
            v-model="role.menu"
            :data="serviceRoutes"
            show-checkbox
            node-key="id"
            :check-strictly="checkStrictly"
            :default-expanded-keys="[]"
            :default-checked-keys="role.menu"
            :props="defaultProps"
            class="permission-tree"
          >
          </el-tree>
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
import { getUserInfo, getRoles, addRole, deleteRole, updateRole } from '@/api/role'
import { getDataPermissions } from '@/api/data_permission'
// import { constantRoutes } from "@/router";
const defaultRole = {
  id: '',
  name: '',
  desc: '',
  menu: []
}
export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      routes: [],
      post: false,
      dataPermission: [],
      rolesList: [],
      serviceRoutes: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getRoutes()
    this.getRoles()
    this.getDatapermission()
  },
  methods: {
    async getRoutes() {
      const { data } = await getUserInfo()
      this.serviceRoutes = data.user_permissions
    },
    async getRoles() {
      const res = await getRoles()
      this.rolesList = res.data
      this.post = res.post_tag
    },
    async getDatapermission() {
      const res = await getDataPermissions({ 'limit': '2000' })
      this.dataPermission = res.data
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedKeys([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(this.role.menu)
        // set checked state of a node not affects its father and child nodes
        this.checkStrictly = false
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('Confirm to remove the role?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await deleteRole(row.id)
          this.rolesList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.getRoles()
        })
        .catch(err => { console.error(err) })
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      this.role.menu = this.$refs.tree.getCheckedKeys()
      if (isEdit) {
        await updateRole(this.role.id, this.role)
        for (let index = 0; index < this.rolesList.length; index++) {
          if (this.rolesList[index].id === this.role.id) {
            this.rolesList.splice(index, 1, Object.assign({}, this.role))
            break
          }
        }
      } else {
        const { data } = await addRole(this.role)
        this.role.key = data.id
        this.rolesList.push(this.role)
      }
      const { desc, id, name } = this.role
      this.dialogVisible = false
      this.getRoles()
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>角色ID: ${id}</div>
            <div>角色名称: ${name}</div>
            <div>描述: ${desc}</div>
`,
        type: 'success'
      })
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
