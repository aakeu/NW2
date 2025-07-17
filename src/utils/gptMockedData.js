export const gptMockedData = {
  Today: [
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
  ],
  'Past 7 Days': [
    'This is the data and all about there isr',
    'This is the data and all about there isq',
    'This is the data and all about there isx',
    'This is the data and all about there isv',
    'This is the data and all about there isd',
    'This is the data and all about there is4',
    'This is the data and all about there ish',
    'This is the data and all about there isk',
    'This is the data and all about there isl',
    'This is the data and all about there is[',
    'This is the data and all about there ism',
    'This is the data and all about there is2',
  ],
  'Previous 30 Days': [
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
  ],
  October: [
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
  ],
  September: [
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
    'This is the data and all about there is',
  ],
}

export const gptModalActions = [
  {
    name: 'Share',
    icon: 'images/popup/gptShare.svg',
  },
  // {
  //   name: 'Rename',
  //   icon: 'images/rename.svg',
  // },
  {
    name: 'Delete',
    icon: 'images/popup/delete.svg',
  },
]

export const gptQuestionAndAnswers = [
  {
    question: 'what are the equipments that make up Lucas-Nuelle power rigs',
    answer:
      'Lucas-Nuelle power rigs are comprehensive training systems designed for electrical power engineering education. They typically include a variety of equipment to simulate and study different aspects of power systems1. Here are some of the key components you might find in a Lucas-Nuelle power rig setup',
  },
  {
    question:
      'Use the LabSoft test rig software to complete the experiment log handouts',
    answer: `Sure! Using the LabSoft test rig software involves several steps to complete your experiment log handouts:

Open the Software: Launch the LabSoft test rig software on your computer.

Create a New Project: Start a new project or open an existing one where you can log your experiments.

Enter Experiment Details: Input the details of each experiment, such as the type of`,
  },
  {
    question: `Regarding the LabSoft test rig software, I consulted a company that sales the software and explain to them what I need the software to do and here is the response they sent to me. Could you explain what the mean. I taught the software is something I would install on my system and supply the respective load(resistive, inductive, capacitive) etc. Below is there response "the Labsoft software is able to provide the features you listed, but there is a part of the system that is not defined. Labsoft is typically installed on test systems for process control. It runs on a computer and controls some resources, especially measurement devices, sometimes also actuators like valves or pumps or others. In the middle between the computer where Parseq runs and the field where the resources are placed there is an elkectronic interface that adapts, converts, amplifies and manages in any other way the signals to and from the field, so that Labsoft can manage digital data. In your request I see that you are considering the software layer (Labsoft) and the resourecs layer (loads and measurement devices), but a layer is missing in the middle: the electronic sction that adapts the signals between the resources and the software. Not having information about this section, it is hard for me to imagine how Labsoft could work for you."`,
    answer: `It sounds like the company is explaining that while the LabSoft software can handle the tasks you need, there's a crucial part of the system that's missing in your setup. Here's a breakdown of their response:

Software Layer (LabSoft): This is the software installed on your computer, responsible for managing and controlling various measurement devices and sometimes actuators.

Resources Layer (Loads and Measurement Devices): These are the physical components you're working with, such as resistive, inductive, and capacitive loads, as well as the measurement devices.

Missing Middle Layer (Electronic Interface): This is the critical part they're highlighting. Between the LabSoft software and the physical devices, there needs to be an electronic interface. This interface:

Adapts and converts signals between the software and the physical devices.

Amplifies and manages signals to ensure they can be accurately interpreted and controlled by the software.

This layer essentially acts as a bridge, enabling LabSoft to communicate effectively with the measurement devices and loads.`,
  },
]
