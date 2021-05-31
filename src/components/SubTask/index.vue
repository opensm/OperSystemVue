<template>
  <dynamic-form
    v-model="data"
    :descriptors="descriptors"
  >
  </dynamic-form>
</template>

<script>
import DynamicForm from 'vue-dynamic-form-component'
export default {
  components: {
    DynamicForm
  },
  data() {
    return {
      descriptors: {
        array: {
          type: 'array',
          label: '更新信息',
          defaultField: {
            type: 'object',
            fields: {
              boolean: { type: 'boolean', required: true },
              string: { type: 'string', label: '更新模板', required: true, pattern: /^test$/g },
              array: {
                type: 'array',
                defaultField: {
                  type: 'object',
                  fields: {
                    boolean: { type: 'boolean', required: true },
                    string: { type: 'string', required: true, pattern: /^test$/g }
                  }
                }
              }
            }
          }
        },
        Select: {
          type: 'array',
          label: '请选择服务',
          required: true,
          defaultField: {
            type: 'enum',
            multiple: false,
            enum: [0, 1, 2, 3],
            options: [
              { label: 'option-0', value: 0, disabled: true },
              { label: 'option-1', value: 1 },
              { label: 'option-2', value: 2 },
              { label: 'option-3', value: 3 }
            ]
          }
        }
      },
      data: {}
    }
  }
}
</script>
