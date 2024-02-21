import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, ListGroup, Spinner, Modal } from 'react-bootstrap';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA5YDDactA38pTM3ibsPvW1DBIsJGzUNsg",
  authDomain: "todoapp-81b62.firebaseapp.com",
  projectId: "todoapp-81b62",
  storageBucket: "todoapp-81b62.appspot.com",
  messagingSenderId: "570004946556",
  appId: "1:570004946556:web:9ac0578eb56cbb46e7d3f9",
  measurementId: "G-NL0TRGMW7Y"
};

firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();

const TodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [editableTask, setEditableTask] = useState(null);
  const [editedText, setEditedText] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      setShowModal(true);
      const tasksCollection = await firestore.collection('tasks').get();
      setTasks(tasksCollection.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setShowModal(false);
    };

    fetchTasks();
  }, []);

  const addTask = async () => {
    if (newTask.trim() !== '') {
      setShowModal(true);
      setLoading(true);
      const taskRef = await firestore.collection('tasks').add({
        text: newTask,
      });

      setTasks([...tasks, { id: taskRef.id, text: newTask }]);
      setNewTask('');
      setLoading(false);
      setShowModal(false);
    }
  };

  const deleteTask = async (taskId) => {
    setShowModal(true);
    setLoading(true);
    await firestore.collection('tasks').doc(taskId).delete();
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    setLoading(false);
    setShowModal(false);
  };

  const updateTask = async (taskId, newText) => {
    setShowModal(true);
    setLoading(true);
    await firestore.collection('tasks').doc(taskId).update({
      text: newText,
    });

    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, text: newText } : task
    );
    setTasks(updatedTasks);
    setLoading(false);
    setShowModal(false);
  };

  const toggleTaskSelection = (taskId) => {
    const isSelected = selectedTasks.includes(taskId);

    if (isSelected) {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const deleteSelectedTasks = async () => {
    setShowModal(true);
    setLoading(true);

    for (const taskId of selectedTasks) {
      await firestore.collection('tasks').doc(taskId).delete();
    }

    const updatedTasks = tasks.filter((task) => !selectedTasks.includes(task.id));
    setTasks(updatedTasks);

    setLoading(false);
    setSelectedTasks([]);
    setShowModal(false);
  };

  const startEditing = (taskId, taskText) => {
    setEditableTask(taskId);
    setEditedText(taskText);
  };

  const saveChanges = (taskId) => {
    if (editedText.trim() !== '') {
      updateTask(taskId, editedText);
      setEditableTask(null);
      setEditedText('');
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Todo App</h1>
      <Row>
        <Col md={8} className="mx-auto">
          <Form>
            <Form.Group controlId="newTask">
              <Form.Control
                type="text"
                placeholder="New Task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={addTask} disabled={loading}>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                'Add Task'
              )}
            </Button>
          </Form>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={8} className="mx-auto">
          <ListGroup>
            {tasks.map((task) => (
              <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center">
                <div>
                  <Form.Check
                    type="checkbox"
                    id={`checkbox-${task.id}`}
                    label={
                      editableTask === task.id ? (
                        <Form.Control
                          type="text"
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                        />
                      ) : (
                        task.text
                      )
                    }
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => toggleTaskSelection(task.id)}
                  />
                </div>
                <div>
                  {editableTask === task.id ? (
                    <Button variant="success" onClick={() => saveChanges(task.id)}>
                      Save
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={() => startEditing(task.id, task.text)}>
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    onClick={() => deleteTask(task.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      'Delete'
                    )}
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={8} className="mx-auto">
          <Button
            variant="danger"
            onClick={deleteSelectedTasks}
            disabled={loading || selectedTasks.length === 0}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              'Delete Selected'
            )}
          </Button>
        </Col>
      </Row>

      <Modal show={showModal} centered backdrop="static" keyboard={false}>
        <Modal.Body>
          <Spinner animation="border" size="lg" />
          <p className="mt-3">Please wait...</p>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default TodoApp;
