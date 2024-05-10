<template>
  <Row :align="'middle'">
    <Col :span="4">
    <Typography.Title>TODOs</Typography.Title>
    </Col>
    <Col :span="4" :offset="16">
    <Row justify="end">
      <Button type="primary" size="middle" @click="showModal">Add TODO</Button>
    </Row>
    </Col>
  </Row>
  <Modal :visible="modalOpened" :title="editMode ? 'Update your TODO' : 'Create your new TODO'"
    :ok-text="editMode ? 'Update' : 'Create'" :onOk="editMode ? handleEdit : handleOk" :onCancel="handleCancel">
    <Form :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
      <Form.Item label="Name" v-bind="validateInfos.text">
        <Input v-model:value="modelRef.text" class="input" placeholder="Type name of todo" />
      </Form.Item>
      <Form.Item label="Date" v-bind="validateInfos.date">
        <DatePicker v-model="modelRef.date"
          :placeholder="modelRef.date !== undefined ? `${modelRef.date.toLocaleDateString()}` : 'Select a date'" />
      </Form.Item>
    </Form>
  </Modal>
  <Row :align="'middle'" justify="start">
    
        <Typography class="icon">Done: {{ store.doneTodosCount }}</Typography>
        <Typography class="icon">Important: {{ store.importantTodosCount }}</Typography>
        <Typography class="icon">Active: {{ store.activeTodosCount }}</Typography>
  </Row>
  <List bordered :data-source="store.todos" :style="{ paddingTop: '10px' }">
    <template #renderItem="{ item }">
      <Row :align="'middle'" justify="center" :style="{ paddingBottom: '10px' }">
        <Col :span="3" :offset="0">
        <CheckOutlined class="icon" :style="{ fontSize: '18px', color: 'green' }" @click="store.toggleDone(item.id)"
          title="Toggle done" />
        <ExclamationOutlined :style="{ fontSize: '18px', color: 'red' }" @click="store.toggleImportant(item.id)"
          title="Toggle important" />
        </Col>
        <Col :span="16">
        <Row :align="'middle'" justify="center">
          <Col :span="24">
          <Row :align="'middle'" justify="center">
            <Typography :class="{ 'line-through': item.done, 'text-bold': item.important, 'text-center': true }"
              :style="{ fontSize: '17px' }">{{
                item.text
              }}
            </Typography>
          </Row>
          <Row :align="'middle'" justify="center">
            <Typography :class="{ 'line-through': item.done, 'text-bold': item.important, 'text-center': true }">{{
              new Date(item.date).toLocaleDateString()
              }}
            </Typography>
          </Row>
          </Col>
        </Row>
        </Col>
        <Col :span="3">
        <Row :align="'middle'" justify="end">
          <EditOutlined class="icon" :style="{ fontSize: '18px' }" @click="editTodo(item)" title="Edit"/>
          <CloseCircleOutlined class="icon" :style="{ fontSize: '18px' }" @click="handleDeleteTodo(item.id)" title="Remove"/>
        </Row>
        </Col>
      </Row>

    </template>
  </List>
</template>

<script setup lang="ts">
import { DatePicker, Input, List, ListItem, Typography, Button, Row, Col, Form, Modal, message } from 'ant-design-vue';
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
      message: 'Please insert a name',
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
        modalOpened.value = false;
        openSuccessMessage('TODO updated!')
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

h1.ant-typography {
  margin-top: 15px
}

.text-bold {
  font-weight: 700;
}

.text-center {
  text-align: center;
}
</style>
