
import { WorkExp } from '@/types';

export const workexp: WorkExp[] = [
  {
    company: 'Visual Concepts Entertainment - 2K Games',
    jobtitle: 'Software Engineer',
    overview:
      'Worked on NBA 2K series, Lego 2K Drive and a moblie game',
    description:
    ['Engineered diverse gameplay and UI elements, including overlays, menus, and camera systems, across multiple online and offline game modes',
      'Successfully migrated features between different gaming platforms, ensuring a consistent player experience',
      'Integrated innovative features including Instant Replay, Photo Moments, Highlight Builder, seamless Activity transitions and the engaging Quest system within the open world, empowering players with a wide range of interactive capabilities'],
    techStack: ['C++','Perforce','Helix'],
    techLogo: ['/logos/file_type_cpp3.svg', '/logos/file_type_helix.svg'],
    startDate: new Date('2020-10-05'),
    link: 'https://vcentertainment.com/',
    slug: 'VisualConceptsEntertainment',
  },
  {
    company: 'DigiPen Institute of Technology',
    jobtitle: 'Research Assistant in Data Visualization and Machine Learning Techniques',
    overview:
      'Masters thesis - Clustering Analysis on Tropical Cyclones',
    description:
    ['Extracted cleaned and analyzed the brightness temperature of cyclone provided by the SSMIS satellite',
      'Implemented multi-processing by paralleling the creation of Images to reduce the run time overhead taking 1/4th of the initial time',
      'Determined the efficiency of Clustering techniques by applying them to the dataset through intensive research and data analysis'],
    techStack: ['Python','Jupyter Notebook','Visual Studio Code'],
    techLogo: ['/logos/file_type_python.svg', '/logos/file_type_jupyter.svg', '/logos/file_type_vscode.svg'],
    startDate: new Date('2020-05-05'),
    endDate: new Date('2020-08-31'),
    link: 'https://www.digipen.edu/',
    slug: 'DigipenInstituteOfTechnology',
  },  
  {
    company: 'NorthWest Research Associates',
    jobtitle: 'Data Science Intern',
    overview:
      'Data engineering and analysis on satellite data',
    description:
    ['Explored dataset provided by NASA and other Research Institutes about Lightning and Microwave satellite to convert it into images using MATLAB and Python.',
      'Segregated the images according to Cyclone Intensity using ML techniques and knowledge of Atmospheric Science',
      'Used Tableau and matplotlib for statistical and graphical analysis'],
    techStack: ['Python','Jupyter Notebook','Visual Studio Code'],
    techLogo: ['/logos/file_type_python.svg', '/logos/file_type_jupyter.svg', '/logos/file_type_vscode.svg'],
    startDate: new Date('2019-09-03'),
    endDate: new Date('2019-12-13'),
    link: 'https://www.nwra.com/',
    slug: 'NorthWestResearchAssociates',
  },
  {
    company: 'DigiPen Institute of Technology',
    jobtitle: 'Teaching Assistant in Computer Science and Physics Department',
    overview:
      'Assisted students with projects and professor with grading',
    description:
    ['Assisted students with assignments and lab expriments',
      'Supervised the Motion Dynamics Lab',
      'Graded assignments and lab reports under the guidance of Professor',
      'Wrote scripts in Shell to automate the grading process'],
    techStack: ['Shell','Visual Studio Code'],
    techLogo: ['/logos/file_type_python.svg', '/logos/file_type_jupyter.svg', '/logos/file_type_vscode.svg'],
    startDate: new Date('2019-01-07'),
    endDate: new Date('2020-09-30'),
    link: 'https://www.digipen.edu/',
    slug: 'DigipenInstituteOfTechnology',
  }
];
