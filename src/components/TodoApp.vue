<template>
  <Row :align="'middle'" justify="space-between">
    <Col :span="4">
    <Typography.Title>TODOs</Typography.Title>
    </Col>
    <Col :span="4">
    <Button @click="showModal">New +</Button>
    </Col>
  </Row>
  <Modal :visible="modalOpened" title="Create your new TODO" :ok-text="'Add'" :onOk="handleOk" :onCancel="hideModal">
    <Form>
      <Form.Item>
        <Input v-model:value="text" class="input" placeholder="Type name of todo" />
      </Form.Item>
      <Form.Item>
        <DatePicker v-model="date" :placeholder="date !== undefined ? `${date.toDateString()}` : 'Select a date'" />
      </Form.Item>
    </Form>
  </Modal>
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
import { DatePicker, Input, List, ListItem, Typography, Button, Space, Row, Col, Form, Modal } from 'ant-design-vue';
import { ref } from 'vue';
import { useTodoStore } from '@/stores/todo';
import { v4 as uuidv4 } from 'uuid';
import CloseCircleOutlined from '@ant-design/icons-vue/lib/icons/CloseCircleOutlined';
import CheckOutlined from '@ant-design/icons-vue/lib/icons/CheckOutlined';
import ExclamationOutlined from '@ant-design/icons-vue/lib/icons/ExclamationOutlined';

// Modal handling
const modalOpened = ref<boolean>(false)

const showModal = () => {
  modalOpened.value = true;
};

const hideModal = () => {
  modalOpened.value = false;
  resetTodo()
}

const handleOk = (e: MouseEvent) => {
  console.log("E PERCHEé")
  modalOpened.value = false;
  handleAddTodo()
  resetTodo()
};


const text = ref<string>('');
const date = ref<Date>(new Date())

const resetTodo = () => {
  text.value = ""
  date.value = new Date()
}

const store = useTodoStore();

// at startup get all todos from server
store.getTodos()

function createTodo(text: string, date: Date) {
  return { text, id: uuidv4(), date, done: false, important: false };
}

function handleAddTodo() {
  const todo = createTodo(text.value, date.value || new Date());
  store.addTodo(todo);

  text.value = '';
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
