export interface DisciplineItem {
  n: string;
  title: string;
  tag: string;
  detail: string;
}

export const disciplinesData: DisciplineItem[] = [
  {
    n: '01',
    title: 'Dhallywood Cinema',
    tag: 'CINEMA',
    detail: 'Lead and featured roles across mainstream Bangladeshi cinema, from her silver-screen debut in Wazed Ali Sumon\'s "Hitman" to award-winning performances in "Begum Jaan", "Birangona 71", and "Ghor Vanga Songsar".'
  },
  {
    n: '02',
    title: 'Television Mega-Serials',
    tag: 'TELEVISION',
    detail: 'Established widespread household popularity through landmark drama serials including "Gulshan Avenue", "Ronger Songsar", "Bonbala", and "Ponditer Mela", broadcast on satellite television nationwide.'
  },
  {
    n: '03',
    title: 'Commercials & Music Visuals',
    tag: 'COMMERCIAL',
    detail: 'Leading campaigns for major FMCG brands including Pran Fruto and Brittle Biscuit, fashion runways, and high-profile musical visual tracks including Asif Akbar\'s "Kanya Tomare".'
  },
  {
    n: '04',
    title: 'Awards & Industry Honors',
    tag: 'HONORS',
    detail: 'Winner of the Babisas Award for Best Actress (2019) for "Begum Jaan", and nominated for Best Newcomer at the prestigious Meril-Prothom Alo Awards (2014).'
  }
];

export const disciplines = disciplinesData;
