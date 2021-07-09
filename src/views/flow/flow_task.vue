<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="审批流程id" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="相关任务">
        <template slot-scope="{row}">
          <span>{{ row.task_st }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="相关流程">
        <template slot-scope="{row}">
          <span>{{ row.engine_st }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="auto" label="状态">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-select
              v-model="row.status"
              filterable
              allow-create
              default-first-option
              placeholder="请选择项目"
            >
              <el-option
                v-for="(value, index) in statusChoice"
                :key="index"
                :label="value.value"
                :value="value.key"
              />
            </el-select>
            <el-button
              class="cancel-btn"
              size="small"
              icon="el-icon-refresh"
              type="warning"
              @click="cancelEdit(row)"
            >
              cancel
            </el-button>
          </template>
          <span v-else>
            <el-tag :type="row.status| statusFilter">
              {{ row.status|statusView }}
            </el-tag>
          </span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="{row}">
          <el-button
            v-if="row.edit"
            type="success"
            size="small"
            icon="el-icon-circle-check-outline"
            @click="confirmEdit(row)"
          >
            确认
          </el-button>
          <el-button
            v-else
            :disabled=" ! row.button.map(item => item === 'PUT')"
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="row.edit=!row.edit"
          >
            审批
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
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { getFlowTasks, updateFlowTask } from '@/api/flow_task'
import Pagination from '@/components/Pagination'
export default {
  name: 'InlineEditTable',
  components: {
    Pagination
  },
  directives: {
    waves
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        pass: 'success',
        unprocessed: 'info',
        refuse: 'danger'
      }
      return statusMap[status]
    },
    statusView(status) {
      const statusMap = {
        pass: '通过',
        unprocessed: '还未审批',
        refuse: '拒绝'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      statusChoice: [{ 'key': 'pass', 'value': '通过' }, { 'key': 'refuse', 'value': '拒绝' }],
      listQuery: {
        page: 1,
        limit: 10000
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getFlowTasks(this.listQuery).then(response => {
        const { data } = response
        const items = data
        this.total = data.total
        this.list = items.map(v => {
          this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
          v.originalTitle = v.title //  will be used when user click the cancel botton
          return v
        })
        this.listLoading = false
      })
    },
    cancelEdit(row) {
      row.title = row.originalTitle
      row.edit = false
      this.$message({
        message: '取消了相关更改操作，请刷新页面！',
        type: 'warning'
      })
    },
    confirmEdit(row) {
      row.edit = false
      row.originalTitle = row.title
      updateFlowTask(row.id, { 'status': row.status }).then(response => {
        const { data } = response
        if (data.meta.code === '00000') {
          this.$message({
            message: '修改成功: ' + data.meta,
            type: 'success'
          })
        } else {
          this.$message({
            message: '修改失败: ' + data.meta,
            type: 'danger'
          })
        }
        this.getList()
      })
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
