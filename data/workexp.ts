
import { WorkExp } from '@/types';

export const workexp: WorkExp[] = [
  {
    company: 'Visual Concepts Entertainment - 2K Games',
    jobtitle: 'Software Engineer',
    overview:
      'Worked on NBA 2K series, Lego 2K Drive and in unannounced moblie game',
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
      'Thesis work',
    description:
    ['Extracted cleaned and analyzed the brightness temperature of cyclone provided by the SSMIS satellite',
      'Implemented multi-processing by paralleling the creation of Images to reduce the run time overhead taking 1/4th of the initial time',
      'Determined the efficiency of Clustering techniques by applying them to the dataset through intensive research and data analysis'],
    techStack: ['Python','Jupyter Notebook','Visual Studio Code'],
    techLogo: ['/logos/file_type_python.svg', '/logos/file_type_jupyter.svg', '/logos/file_type_vscode.svg'],
    link: 'https://vcentertainment.com/',
    slug: 'VisualConceptsEntertainment',
  },
];
