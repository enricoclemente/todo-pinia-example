<template>
  <Row :align="'middle'" justify="space-between">
    <Col :span="4">
    <Typography.Title>TODOs</Typography.Title>
    </Col>
    <Col :span="4">
    <Button @click="showModal">New +</Button>
    </Col>
  </Row>
  <Modal :visible="modalOpened" :title="editMode ? 'Update your TODO' : 'Create your new TODO'"
    :ok-text="editMode ? 'Update' : 'Create'" :onOk="editMode ? handleEdit : handleOk" :onCancel="handleCancel">
    <Form>
      <Form.Item label="Title" v-bind="validateInfos.text">
        <Input v-model:value="modelRef.text" class="input" placeholder="Type name of todo" />
      </Form.Item>
      <Form.Item label="Date" v-bind="validateInfos.date">
        <DatePicker v-model="modelRef.date"
          :placeholder="modelRef.date !== undefined ? `${modelRef.date}` : 'Select a date'" />
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
          <Typography underline=true :class="{ 'line-through': item.done, 'text-bold': item.important }">{{
            item.text
          }}
          </Typography>
          <Typography :class="{ 'line-through': item.done, 'text-bold': item.important }">{{
            item.date
          }}
          </Typography>
        </div>
        <div>
          <EditOutlined class="icon" @click="editTodo(item)" />
          <CloseCircleOutlined @click="handleDeleteTodo(item.id)" />
        </div>
      </ListItem>
    </template>
  </List>
</template>

<script setup lang="ts">
import { DatePicker, Input, List, ListItem, Typography, Button, Space, Row, Col, Form, Modal, message } from 'ant-design-vue';
import { ref, reactive, toRaw } from 'vue';
import { useTodoStore } from '@/stores/todo';
import { v4 as uuidv4 } from 'uuid';
import EditOutlined from '@ant-design/icons-vue/lib/icons/EditOutlined';
import CloseCircleOutlined from '@ant-design/icons-vue/lib/icons/CloseCircleOutlined';
import CheckOutlined from '@ant-design/icons-vue/lib/icons/CheckOutlined';
import ExclamationOutlined from '@ant-design/icons-vue/lib/icons/ExclamationOutlined';
import type { ITodo } from '@/interfaces';

// Modal handling
const modalOpened = ref<boolean>(false)

const showModal = () => {
  modalOpened.value = true;
};

const handleCancel = () => {
  modalOpened.value = false;
  editMode.value = false;
  resetFields()
}

const useForm = Form.useForm;
const modelRef = reactive({
  id: '',
  text: '',
  date: new Date()
})

const rulesRef = reactive({
  text: [
    {
      required: true,
      message: 'Please insert a title',
    },
  ],
  date: [
    {
      required: true,
      message: 'Please select a date',
    },
  ],
});

const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef, {
  //onValidate: (...args) => console.log(...args),
});

const handleOk = () => {
  validate()
    .then(() => {
      console.debug(toRaw(modelRef));
      handleAddTodo()
    })
    .catch(err => {
      console.debug('Error validating fields', err);
    });
};

const handleEdit = () => {
  validate()
    .then(() => {
      console.debug(toRaw(modelRef));
      handleEditTodo()
    })
    .catch(err => {
      console.debug('Error validating fields', err);
    });
}

const store = useTodoStore();

// at startup get all todos from server
store.getTodos()
  .then(() => {
    if (store.error) {
      openErrorMessage('Error getting TODOs! Server error')
    }
  })

function createTodo(text: string, date: Date) {
  return { text, id: uuidv4(), date, done: false, important: false };
}

function handleAddTodo() {
  const todo = createTodo(modelRef.text, modelRef.date);
  store.addTodo(todo)
    .then(() => {
      if (!store.error) {
        openSuccessMessage('TODO created!')
        modalOpened.value = false;
        resetFields()
      } else {
        openErrorMessage('Error creating TODO! Server error')
      }
    })
}

const editMode = ref<boolean>(false)
function editTodo(item: ITodo) {
  modalOpened.value = true
  modelRef.id = item.id
  modelRef.text = item.text
  modelRef.date = new Date(item.date)
  editMode.value = true
}

function handleEditTodo() {
  store.updateTodo(modelRef.id, { text: modelRef.text, date: modelRef.date })
    .then(() => {
      if (!store.error) {
        openSuccessMessage('TODO updated!')
        modalOpened.value = false;
        resetFields()
      } else {
        openErrorMessage('Error updating TODO! Server error')
      }
    })

  editMode.value = false;
}

function handleDeleteTodo(id: string) {
  store.removeTodo(id)
    .then(() => {
      if (!store.error) {
        openSuccessMessage('TODO deleted!')
      } else {
        openErrorMessage('Error deleting TODO! Server error')
      }
    })
}

// Feedback messages
const key = 'updatable';
const openSuccessMessage = (messageText: string) => {
  message.success({ content: messageText, key, duration: 2 });
};
const openErrorMessage = (messageText: string) => {
  message.error({ content: messageText, key, duration: 4 });
};
</script>

<style scoped>
.icon {
  margin-right: 10px;
  margin-left: 10px;
}

.line-through {
  text-decoration: line-through;
}

.text-bold {
  font-weight: 700;
}
</style>
