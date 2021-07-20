<template>
  <div class="app-container">
    <el-form
      ref="addJsonForm"
      :model="addJsonForm"
      :rules="addJsonForm.addJsonRules"
      :inline="true"
      label-width="108px"
    >
      <el-table
        v-loading="listLoading"
        :data="addJsonForm.params"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
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

        <el-table-column width="180px" label="状态">
          <template slot-scope="scope">
            <template v-if="scope.row.edit">
              <el-form-item :prop="'params.' + scope.$index + '.status'" :rules="addJsonForm.addJsonRules.status">
                <el-select
                  v-model="scope.row.status"
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请审核"
                >
                  <el-option
                    v-for="(value, index) in statusChoice"
                    :key="index"
                    :label="value.value"
                    :value="value.key"
                  />
                </el-select>
              </el-form-item>
            </template>
            <span v-else>
              <el-tag :type="scope.row.status| statusFilter">
                {{ scope.row.status|statusView }}
              </el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column min-width="auto" label="原因">
          <template slot-scope="scope">
            <template v-if="scope.row.edit">
              <el-form-item :prop="'params.' + scope.$index + '.approval_note'" :rules="addJsonForm.addJsonRules.approval_note">
                <el-input
                  v-model="scope.row.approval_note"
                  type="textarea"
                  placeholder="请填写原因"
                />
              </el-form-item>
              <el-button
                class="cancel-btn"
                size="small"
                icon="el-icon-refresh"
                type="warning"
                @click="cancelEdit(scope.row)"
              >
                取消
              </el-button>
            </template>
            <span v-else>
              {{ scope.row.approval_note }}
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
              :disabled=" ! buttonStatus(row.button, 'PUT')"
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
    </el-form>
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
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
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
        limit: 10,
        level: undefined,
        sort: '-id'
      },
      addJsonForm: {
        params: [
          {
            status: '',
            approval_note: ''
          }
        ],
        addJsonRules: {
          status: [
            { required: true, message: '装填必须填写', trigger: 'blur' }
          ],
          approval_note: [
            { required: true, message: '请填原因', trigger: 'blur' }
          ]
        }
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
        const { data, total } = response
        this.total = total
        this.addJsonForm.params = data.map(v => {
          this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
          return v
        })
        this.listLoading = false
      })
    },
    buttonStatus(data, button) {
      if (data === undefined || data.length <= 0) {
        return false
      } else {
        return data.includes(button)
      }
    },
    cancelEdit(row) {
      row.edit = false
      this.$message({
        message: '取消了相关更改操作，请刷新页面！',
        type: 'warning'
      })
      this.getList()
    },
    confirmEdit(row) {
      row.edit = false
      this.$refs['addJsonForm'].validate((valid) => {
        if (valid) {
          updateFlowTask(row.id, { 'status': row.status }).then(response => {
            const { meta } = response
            this.$message({
              message: '修改成功: ' + meta.msg,
              type: 'success'
            })
          })
          this.getList()
        }
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
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
