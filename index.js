const inquirer = require('inquirer');
const { writeFile, mkdir, readFile } = require('fs/promises')
const path = require('path')
const { exec } = require("child_process");
const { promisify } = require('util');

const questionsMap = {
  package_manager: {
    options: [{
      name: 'yarn',
      value: 'yarn'
    }, {
      name: 'npm',
      value: 'npm'
    }],
    answer: [],
  },
  framework: {
    options: [{
      name: 'react',
      value: 'react'
    }, {
      name: 'vue',
      value: 'vue'
    }],
    answer: []
  },
  language: {
    options: [{
      name: 'javascript',
      value: 'javascript'
    }, {
      name: 'typescript',
      value: 'typescript'
    }],
    answer: []
  },
  css_library: {
    options: [{
      name: 'scss',
      value: 'scss'
    }, {
      name: 'css',
      value: 'css'
    }],
    answer: []
  },
  architecture: {
    options: [{
      name: 'Modular',
      value: 'modular',
    }, {
      name: "Atomic design",
      value: 'atomic_design',
    }, {
      name: 'Feature sliced',
      value: 'feature_sliced'
    }, {
      name: "Without architecture",
      value: 'none'
    }],
    answer: []
  }
}

const buildSingleOption = async (name, choices, type = 'list') => {
  const result = await inquirer.prompt([
    {
      type,
      message: `Select ${name}`,
      name,
      choices,
      validate(answer) {
        if (answer.length < 1) {
          return 'This option is required.';
        }

        return true;
      },
    },
  ])

  return result[name]
}

const commandBuilder = async () => {
  for (const key in questionsMap) {
    const { options } = questionsMap[key]

    questionsMap[key] = {
      ...questionsMap[key],
      answer: await buildSingleOption(key, options)
    }
  }

  return questionsMap
}

const buildModular = async ({ framework, language }) => {

  await Promise.all([
    mkdir(path.join(__dirname, 'draft', 'pages')),
    mkdir(path.join(__dirname, 'draft', 'modules')),
  ])


  switch (framework) {
    case 'vue':
      // TODO: можно использовать копирование темплейтов с тем же расширением, а не создание из текстовых файлов
      const draftPath = path.join(__dirname, 'templates', 'vue', 'page.txt');
      const code = await readFile(draftPath, { encoding: 'utf-8' })

      await writeFile(path.join(__dirname, 'draft', 'pages', 'Home.vue'), code)
      break;

    case 'react':
      console.log('react is not implemented')
    default:
      break;
  }
}

const buildStructure = async ({ architecture, framework, language }) => {
  switch (architecture) {
    case 'modular':
      await buildModular({ framework, language });
      break;
    case 'atomic_design':
      console.log('"atomic_design" is not implemented');
      break;
    case 'feature_sliced':
      console.log('"feature_sliced" is not implemented');
      break;
    case 'none':
      break;
    default:
      break;
  }
}

const executeCommands = async () => {
  const opts = await commandBuilder()

  const draftPath = path.join(__dirname, 'draft');
  const manager = opts.package_manager.answer;
  const framework = opts.framework.answer;
  const language = opts.language.answer;
  const cssLib = opts.css_library.answer;
  const architecture = opts.architecture.answer;

  const installWord = manager === 'yarn' ? 'add' : 'install'

  await promisify(exec)(`${manager} init -y`, { cwd: draftPath });
  await promisify(exec)(`${manager} ${installWord} ${framework}`, { cwd: draftPath });

  if (language !== 'javascript') {
    await promisify(exec)(`${manager} ${installWord} ${language} -D`, { cwd: draftPath });
  }

  if (cssLib !== 'css') {
    await promisify(exec)(`${manager} ${installWord} ${cssLib}`, { cwd: draftPath });
  }

  await buildStructure({ architecture, framework, language })
}

(async () => await executeCommands())()
