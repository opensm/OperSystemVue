<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.container"
        placeholder="发版名称"
        style="width: 500px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        :disabled="post ==='false'"
        @click="handleCreate"
      >
        新增
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        type="expand"
      >
        <template slot-scope="{row}">
          <el-form label-position="left" inline class="demo-table-expand">
            <template v-for="(item,key) in row.exec_list">
              <el-form-item :key="key" label="操作ID">
                <span>{{ item.id }}</span>
              </el-form-item>
              <el-form-item :key="key" label="操作类型">
                <span>{{ item.exec_type }}</span>
              </el-form-item>
              <el-form-item :key="key" label="更新参数">
                <span>{{ item.params }}</span>
              </el-form-item>
              <el-form-item :key="key" label="更新状态">
                <span>{{ item.status }}</span>
              </el-form-item>
              <el-form-item :key="key" label="输出信息">
                <span>{{ item.output }}</span>
              </el-form-item>
              <el-form-item :key="key" label="创建时间">
                <span>{{ item.create_time }}</span>
              </el-form-item>
              <el-form-item :key="key" label="完成时间">
                <span>{{ item.finish_time }}</span>
              </el-form-item>
            </template>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="执行服务" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.container }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属项目" align="center">
        <template slot-scope="{row}">
          <span>{{ row.project | dataList(projectList) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建用户" align="center">
        <template slot-scope="{row}">
          {{ row.create_user|dataList(userList) }}
        </template>
      </el-table-column>
      <el-table-column label="开发用户" align="center">
        <template slot-scope="{row}">
          {{ row.developer|dataList(userList) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status| tagFilter">{{ row.status|statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="{row}">
          <i
            class="el-icon-time"
          />
          <span>{{ row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" :disabled="! row.button.includes('PUT')" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button
            size="mini"
            type="danger"
            :disabled="! row.button.includes('DELETE')"
            @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 500px; margin-left:50px;"
      >
        <dynamic-form
          v-model="temp"
          :descriptors="descriptors"
        >
        </dynamic-form>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getSubtasks, deleteSubtask, updateSubtask, addSubtask, getObjectid
} from '@/api/subtask'
import waves from '@/directive/waves' // waves directive
import { getProjects } from '@/api/project'
import { getUsersInfo, current_user } from '@/api/user'
import Pagination from '@/components/Pagination'
import DynamicForm from 'vue-dynamic-form-component'

export default {
  name: 'ComplexTable',
  components: {
    Pagination,
    DynamicForm
  },
  objectOptions: [],
  directives: {
    waves
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        'not_start_exec': '任务还未开始',
        'progressing': '任务执行中',
        'success': '任务已完成',
        'fail': '任务失败',
        'unbond': '任务还未绑定'
      }
      return statusMap[status]
    },
    tagFilter(status) {
      const statusMap = {
        'not_start_exec': '',
        'progressing': 'warning',
        'success': 'success',
        'fail': 'danger',
        'unbond': 'info'
      }
      return statusMap[status]
    },
    execListFilter(subs, subTaskList) {
      const map = {}
      subTaskList.map((item) => {
        map[item.id] = item.container
      })
      return subs.map((item) => map[item]).join(',')
    },
    dataList(user, users) {
      const map = {}
      users.map((item) => {
        map[item.value] = item.label
      })
      return map[user]
    }
  },
  data() {
    return {
      tableKey: 0,
      total: 0,
      post: true,
      project: [],
      projectList: [],
      list: [],
      users: [],
      objects: [],
      objectsList: [],
      userList: [],
      create_user: '',
      execList: [],
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        container: undefined,
        sort: '+id'
      },
      sortOptions: [{
        label: 'ID 正序', key: '+id'
      }, {
        label: 'ID 逆序', key: '-id'
      }],
      showReviewer: false,
      temp: {},
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改子任务',
        create: '添加子任务'
      },
      dialogPvVisible: false,
      pvData: [],
      downloadLoading: false
    }
  },
  computed: {
    descriptors() {
      const that = this
      return {
        container: { type: 'string', required: true, label: '更新服务', message: '服务名称必须填', placeholder: '填入服务名称' },
        project: {
          type: 'enum',
          label: '相关项目',
          enum: this.project,
          required: true,
          options: this.projectList,
          message: '所属项目必须选择！', placeholder: '选择项目'
        },
        developer: {
          type: 'enum',
          label: '开发人员',
          enum: this.users,
          required: true,
          options: this.userList,
          message: '开发人员必须选择！', placeholder: '填入开发人员'
        },
        note: { type: 'string', required: true, label: '备注', message: '备注必填！', placeholder: '填入备注' },
        exec_list: {
          type: 'array',
          label: '操作列表',
          required: true,
          defaultField: {
            type: 'object',
            fields: {
              params: { type: 'string', required: true, label: '更新参数', message: '更新参数必填', placeholder: '更新参数' },
              exec_type: {
                type: 'enum',
                label: '操作方式',
                enum: ['update', 'recover'],
                required: true,
                message: '模板必须选择！',
                placeholder: '选择模板',
                options: [
                  { label: '回档', value: 'recover' },
                  { label: '更新', value: 'update' }
                ]
              },
              content_type: {
                type: 'enum',
                label: '模板选择',
                enum: ['TemplateKubernetes', 'TemplateNacos', 'TemplateTencentService', 'TemplateDB'],
                required: true,
                message: '模板必须选择！',
                placeholder: '选择模板',
                events: {
                  change(event) {
                    const urls = {
                      '20': 'templatekubernetes',
                      '15': 'templatedbs',
                      '21': 'tencentservices',
                      '22': 'templatenacoses'
                    }
                    getObjectid(urls[event]).then(response => {
                      const { data } = response
                      that.objects = []
                      that.objectsList = []
                      data.map(item => {
                        that.objects.push(item.id)
                        that.objectsList.push({ 'label': item.name, 'value': item.id })
                      })
                      that.objects = JSON.parse(JSON.stringify(that.objects))
                      console.log(that.objects)
                    })
                  }
                },
                options: [
                  { label: 'Kubernetes模板', value: 20 },
                  { label: 'Nacos模板', value: 22 },
                  { label: '腾讯云服务模板', value: 21 },
                  { label: '数据库模板', value: 15 }
                ]
              },
              object_id: {
                type: 'enum',
                label: '模板选择',
                enum: that.objects,
                required: true,
                message: '模板必须选择！',
                placeholder: '选择模板',
                options: that.objectsList
              }
            }
          }
        }
      }
    }
  },
  created() {
    this.getList()
    this.getProjects()
    this.getCurrentUser()
    this.getUserList()
  },
  methods: {
    getUserList() {
      getUsersInfo().then(response => {
        const { data } = response
        data.map(item => {
          this.users.unshift(item.id)
        })
        data.map(item => {
          this.userList.unshift({ 'label': item.username + ':' + item.name, 'value': item.id })
        })
        this.users = JSON.parse(JSON.stringify(this.users))
      })
    },
    getProjects() {
      getProjects().then(response => {
        const { data } = response
        data.map(item => {
          this.project.push(item.id)
          this.projectList.push({ 'label': item.id + ':' + item.name, 'value': item.id })
        })
        this.project = JSON.parse(JSON.stringify(this.project))
      })
    },
    getCurrentUser() {
      current_user().then(response => {
        const { data } = response
        this.create_user = data.id
      })
    },
    getList() {
      this.listLoading = true
      // 重置选择上的空
      if (this.listQuery.container === '') {
        this.listQuery.container = undefined
      }
      getSubtasks(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        this.post = response.meta.post_tag

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功！',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const {
        prop, order
      } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        container: '',
        exec_list: [],
        note: '',
        project: '',
        create_user: '',
        developer: '',
        create_time: '',
        finish_time: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.create_user = this.create_user
          addSubtask(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建用户成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateSubtask(tempData.id, tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功' + tempData.name,
              message: '修改成功:' + tempData.name,
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      deleteSubtask(row.id).then(response => {
        const {
          meta
        } = response.data
        this.list.splice(index, 1)
        // this.total = response.data.total
        this.$notify({
          title: '成功',
          message: meta.message,
          type: 'success',
          duration: 2000
        })

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>

<style>
.demo-table-expand {
  font-size: 0;
}

.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}

.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
