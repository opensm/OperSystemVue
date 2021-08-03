<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="发版名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        style="margin-left: 10px;"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        :disabled="post === false"
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
          <el-form label-position="left" inline class="demo-table-expand" label-width="200px">
            <template v-for="(item,key) in row.sub_task_st">
              <el-divider :key="key">子任务ID:{{ item.id }}</el-divider>
              <el-form-item :key="key" label="子任务名称：">
                <span>{{ item.container }}</span>
              </el-form-item>
              <el-form-item :key="key" label="状态：">
                <el-tag :type="item.status| tagFilter">{{ item.status|statusFilter }}</el-tag>
              </el-form-item>
              <el-form-item :key="key" label="创建时间：">
                <span>{{ item.create_time }}</span>
              </el-form-item>
              <el-form-item :key="key" label="完成时间：">
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
      <el-table-column label="任务名称" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批流程" align="center">
        <template slot-scope="{row}">
          <span>{{ row.approval_flow_st }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属项目" align="center">
        <template slot-scope="{row}">
          <span>{{ row.project_st }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建用户" align="center">
        <template slot-scope="{row}">
          {{ row.create_user_st }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status|tagFilter">{{ row.status|statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="任务时间" align="center">
        <template slot-scope="{row}">
          <i
            class="el-icon-time"
          />
          <span>{{ row.task_time }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="400" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-document"
            :disabled="! buttonStatus(row.button, 'PUT') || ! ['not_start_approve','approveing'].includes(row.status)"
            @click="handleUpdate(row)"
          >
            修改
          </el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete-solid"
            :disabled="! buttonStatus(row.button,'DELETE') || ! ['not_start_approve','approveing'].includes(row.status)"
            @click="handleDelete(row,$index)"
          >
            删除
          </el-button>
          <el-button
            size="mini"
            icon="el-icon-copy-document"
            type="warning"
            :disabled="post === false"
            @click="handleCopy(row)"
          >
            拷贝
          </el-button>
          <el-button
            size="mini"
            type="info"
            icon="el-icon-info"
            style="margin-left: 16px;"
            @click="handleLogs(row.id)"
          >
            日志
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input
            v-model="temp.name"
          />
        </el-form-item>
        <el-form-item label="项目" prop="project">
          <el-select
            v-model="temp.project"
            filterable
            allow-create
            default-first-option
            placeholder="请选择项目"
          >
            <el-option
              v-for="item in project"
              :key="item.id"
              :label="item.id + ':' + item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="环境" prop="env">
          <el-select
            v-model="temp.env"
            filterable
            allow-create
            default-first-option
            placeholder="请选择环境"
          >
            <el-option
              v-for="item in envOptions"
              :key="item.value"
              :label="item.value + ':' + item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="审批流程" prop="approve_flow">
          <el-select
            v-model="temp.approval_flow"
            filterable
            default-first-option
            placeholder="请选择审批流程"
          >
            <el-option
              v-for="item in flowEngineList"
              :key="item.id"
              :label="item.id + ':' + item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务时间" prop="task_time">
          <el-date-picker
            v-model="temp.task_time"
            type="datetime"
            placeholder="选择日期时间"
            default-time="00:00:00"
          />
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input
            v-model="temp.note"
            :autosize="{ minRows: 2, maxRows: 10}"
            type="textarea"
          />
        </el-form-item>
        <el-form-item label="关联子任务" prop="sub_task">
          <el-select
            v-model="temp.sub_task"
            filterable
            default-first-option
            multiple
            placeholder="请选择子任务"
          >
            <el-option
              v-for="(item,key) in subTaskList"
              :key="key"
              :label="'ID：' + item.id + '， 名称：' + item.container"
              :value="item.id"
              :disabled="item.status !== 'unbond' && item.status !== 'not_start_exec'"
            />
          </el-select>
        </el-form-item>
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
    <el-drawer
      title="任务日志"
      :visible.sync="drawer"
      :direction="direction"
      :before-close="handleClose"
    >
      <el-timeline :reverse="reverse">
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.timestamp"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-drawer>
  </div>
</template>

<script>
import {
  getTasks, deleteTask, updateTask, addTask, get_exec_logs
} from '@/api/task'
import waves from '@/directive/waves' // waves directive
import {
  getSubtasks
} from '@/api/subtask'
import { getProjects } from '@/api/project'
import { getFlowEngines } from '@/api/flow_engine'
import Pagination from '@/components/Pagination'

export default {
  name: 'ComplexTable',
  components: {
    Pagination
  },
  directives: {
    waves
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        'approveing': '审批中',
        'not_start_approve': '还未审批',
        'ok_approved': '审批通过',
        'fail_approve': '审批不通过',
        'not_start_exec': '任务还未开始',
        'progressing': '任务执行中',
        'success': '任务成功',
        'fail': '任务失败',
        'timeout': '任务已超时',
        'unsubmit': '未提交'
      }
      return statusMap[status]
    },
    statusChoice(status) {
      const valueMap = {
        'true': '是',
        'false': '否'
      }
      return valueMap[status]
    },
    subTaskFilter(subs, subTaskList) {
      const map = {}
      subTaskList.map((item) => {
        map[item.id] = item.container
      })
      return subs.map((item) => map[item]).join(',')
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
    dataList(user, users) {
      const map = {}
      users.map((item) => {
        map[item.id] = item.name
      })

      return map[user]
    }
  },
  data() {
    return {
      // 日志弹窗变量
      drawer: false,
      direction: 'rtl',
      // 日志内容变量
      reverse: true,
      activities: [],
      // 任务列表变量
      tableKey: 0,
      total: 0,
      post: true,
      project: [],
      list: [],
      subTaskList: [],
      flowEngineList: [],
      userList: [],
      create_user: '',
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        name: undefined,
        sort: '-id'
      },
      sortOptions: [{
        label: 'ID 正序', key: '+id'
      }, {
        label: 'ID 逆序', key: '-id'
      }],
      envOptions: [{ 'label': '预生产', 'value': 'pre' }, { 'label': '生产', 'value': 'prod' }],
      showReviewer: false,
      temp: {
        id: undefined,
        name: '',
        approval_flow: '',
        sub_task: [],
        note: '',
        project: '',
        create_user: '',
        developer: '',
        task_time: '',
        env: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改任务',
        create: '添加任务'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{
          required: true, message: '任务名称必须填写！', trigger: 'blur'
        }],
        env: [{
          required: true, message: '任务环境必须填写！', trigger: 'blur'
        }],
        approval_flow: [{
          required: true, message: '审批流程必须填写！', trigger: 'blur'
        }],
        note: [{
          required: true, message: '上线备注必须填写！', trigger: 'blur'
        }],
        project: [{
          required: true, message: '所属项目必须填写！', trigger: 'blur'
        }],
        task_time: [{
          required: true, message: '任务时间必须填写！', trigger: 'blur'
        }],
        sub_task: [{
          required: true, message: '子任务信息必须填写！', trigger: 'blur'
        }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    format_time() {
      const yy = new Date().getFullYear()
      const mm = new Date().getMonth() + 1
      const dd = new Date().getDate()
      const hh = new Date().getHours() < 10 ? '0' + new Date().getHours() : new Date().getHours()
      const mf = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()
      return `${yy}${mm}${dd}${hh}${mf}`
    },
    handleClose(done) {
      done()
    },
    buttonStatus(data, button) {
      if (data === undefined || data.length <= 0) {
        return false
      } else {
        return data.includes(button)
      }
    },
    getProjects() {
      getProjects().then(response => {
        this.project = response.data
      })
    },
    getFlowEngine() {
      getFlowEngines().then(response => {
        const { data } = response
        this.flowEngineList = data
      })
    },
    getSubtask() {
      getSubtasks({ 'status': 'unbond', 'limit': 100 }).then(response => {
        this.subTaskList = response.data
      })
    },
    getList() {
      this.listLoading = true
      // 重置选择上的空
      if (this.listQuery.name === '') {
        this.listQuery.name = undefined
      }
      getTasks(this.listQuery).then(response => {
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
      // this.listQuery.page = 1
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
        name: '',
        approval_flow: '',
        sub_task: [],
        note: '',
        project: '',
        create_user: '',
        developer: '',
        task_time: '',
        env: ''
      }
    },
    handleLogs(task) {
      this.drawer = true
      this.activities = []
      get_exec_logs({ 'task': task }).then(response => {
        const { data } = response
        data.map(item => {
          this.activities.push({
            content: item.log,
            timestamp: item.create_time
          })
        })
      })
    },
    handleCreate() {
      this.resetTemp()
      this.getProjects()
      this.getFlowEngine()
      this.getSubtask()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const local_time = this.format_time()
          this.temp.name = local_time + '_' + this.temp.env + '_' + this.temp.name
          this.temp.task_time = this.moment(this.temp.task_time).format('YYYY-MM-DD HH:mm:ss')
          addTask(this.temp).then(response => {
            const { meta } = response
            this.list.unshift(this.temp)
            this.$notify({
              title: '成功',
              message: meta.msg,
              type: 'success',
              duration: 2000
            })
            this.dialogFormVisible = false
            this.handleFilter()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = {}
      this.temp = Object.assign({}, row) // copy obj
      this.getProjects()
      this.getFlowEngine()
      this.getSubtask()
      this.temp.env = this.temp.name.split('_')[1]
      this.temp.name = this.temp.name.split('_')[2]
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleCopy(row) {
      this.temp = {}
      this.temp = Object.assign({}, row) // copy obj
      this.getProjects()
      this.getFlowEngine()
      this.getSubtask()
      this.temp.task_time = ''
      this.temp.env = this.temp.name.split('_')[1]
      this.temp.name = this.temp.name.split('_')[2]
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const local_time = this.format_time()
          const tempData = Object.assign({}, this.temp)
          tempData.task_time = this.moment(tempData.task_time).format('YYYY-MM-DD HH:mm:ss')
          tempData.name = local_time + '_' + this.temp.env + '_' + this.temp.name
          updateTask(tempData.id, tempData).then(response => {
            const { meta } = response
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.$notify({
              title: '成功',
              message: meta.msg,
              type: 'success',
              duration: 2000
            })
            this.dialogFormVisible = false
            this.handleFilter()
          })
        }
      })
    },
    handleDelete(row, index) {
      deleteTask(row.id).then(response => {
        const { meta } = response
        this.list.splice(index, 1)
        this.$notify({
          title: '成功',
          message: meta.msg,
          type: 'success',
          duration: 2000
        })
        this.dialogFormVisible = false
        this.handleFilter()
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
<style rel="stylesheet/scss" lang="scss">
.el-drawer{

  overflow: scroll
}

</style>
