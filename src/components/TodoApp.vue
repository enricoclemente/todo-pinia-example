<template>
  <Row :align="'middle'" justify="space-between">
    <Col :span="4">
    <Typography.Title>TODOs</Typography.Title>
    </Col>
  </Row>
  <Row :align="'middle'" justify="space-between">
    <Col :span="14">
    <Input v-model:value="field" class="input" @keyup.enter="handleAddTodo" placeholder="Type name of todo" />
    </Col>
    <Col :span="5" :offset="1">
    <DatePicker v-model="date" :placeholder="date ? `${date.toDateString()}` : 'Select a date'"/>
    </Col>
    <Col :span="4"><Button @click="handleAddTodo">Add</Button></Col>
  </Row>
  <Row :align="'middle'" justify="start">
    <Col :span="4">
    <Typography>Done: {{ store.doneTodosCount }}</Typography>
    </Col>
    <Col :span="4">
    <Typography>Important: {{ store.importantTodosCount }}</Typography>
    </Col>
    <Col :span="4">
    <Typography>Active: {{ store.activeTodosCount }}</Typography>
    </Col>
  </Row>
  <List bordered :data-source="store.todos">
    <template #renderItem="{ item }">
      <ListItem>
        <div>
          <CheckOutlined class="icon" @click="store.toggleDone(item.id)" title="Toggle done" />
          <ExclamationOutlined color="red" @click="store.toggleImportant(item.id)" title="Toggle important" />
        </div>
        <div>
          <Typography :class="{ 'line-through': item.done, 'text-bold': item.important }">{{
          item.text
          }}
        </Typography>
          <Typography :class="{ 'line-through': item.done, 'text-bold': item.important }">{{
            new Date(item.date).toDateString()
          }}
        </Typography>
        </div>
        
        
        <CloseCircleOutlined @click="store.removeTodo(item.id)" />
      </ListItem>
    </template>
  </List>
</template>

<script setup lang="ts">
import { DatePicker, Input, List, ListItem, Typography, Button, Space, Row, Col } from 'ant-design-vue';
import { ref } from 'vue';
import { useTodoStore } from '@/stores/todo';
import { v4 as uuidv4 } from 'uuid';
import CloseCircleOutlined from '@ant-design/icons-vue/lib/icons/CloseCircleOutlined';
import CheckOutlined from '@ant-design/icons-vue/lib/icons/CheckOutlined';
import ExclamationOutlined from '@ant-design/icons-vue/lib/icons/ExclamationOutlined';

const field = ref('');
const date = ref(new Date())
const store = useTodoStore();

// at startup get all todos from server
store.getTodos()

function createTodo(text: string, date: Date) {
  return { text, id: uuidv4(), date, done: false, important: false };
}

function handleAddTodo() {
  const todo = createTodo(field.value, date.value);
  store.addTodo(todo);

  field.value = '';
}
</script>

<style scoped>
.input {
  margin: 15px 0;
}

.icon {
  margin-right: 10px;
}

.line-through {
  text-decoration: line-through;
}

.text-bold {
  font-weight: 700;
}
</style>
