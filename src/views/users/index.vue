<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="序号" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="用户">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="邮箱">
        <template slot-scope="scope">
          {{ scope.row.email }}
        </template>
      </el-table-column>
      <el-table-column label="角色" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.roles }}</span>
        </template>
      </el-table-column>
      <el-table-column label="超级用户" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.is_superuser|statusChoice }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.is_active | statusFilter">{{ scope.row.is_active|statusChoice }}</el-tag>
<!--          <el-tag :type="scope.row.is_active | statusFilter">{{ scope.row.is_active }}</el-tag>-->
        </template>
      </el-table-column>
      <el-table-column align="center" prop="create_date" label="创建日期" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time"/>
          <span>{{ scope.row.create_date }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.desc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="删除" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.desc }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {getUserList} from '@/api/table'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        'true': 'success',
        // draft: 'gray',
        'false': 'danger'
      }
      return statusMap[status]
    },
    statusChoice(status) {
      const valueMap = {
        'true': '是',
        'false': '否'
      }
      return valueMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      statusChioce: {
        'true': '是',
        'false': '否'
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      getUserList().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    }
  }
}
</script>
