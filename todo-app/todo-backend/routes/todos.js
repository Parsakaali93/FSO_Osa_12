const express = require('express');
const { Todo } = require('../mongo');
const { getAsync, setAsync } = require('../redis');
const router = express.Router();

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })

  const added = await getAsync("added_todos")

  let incremented = 1

  if(added)
     incremented = parseInt(added) +1

  await setAsync("added_todos", incremented)

  res.send(todo);
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  const todo = await req.todo;
  res.send(todo)
  // res.sendStatus(200);
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  const { text, done } = req.body; 
  req.todo.done = done; 
  req.todo.text = text;
  await req.todo.save();
  res.sendStatus(200);
});

router.use('/:id', findByIdMiddleware, singleRouter)

module.exports = router;
