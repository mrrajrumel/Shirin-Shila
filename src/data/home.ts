import { heroProfile } from './hero';
import { stats } from './stats';
import { filmography } from './filmography';

export const profile = heroProfile;
export { stats };

export const featuredWork = filmography
  .filter((item) => item.featured)
  .slice(0, 6)
  .map((item) => ({
    id: item.id,
    title: item.title,
    banglaTitle: item.banglaTitle,
    type: item.category,
    year: item.year,
    director: item.director,
    coStar: item.coStar,
    note: item.description,
    image: item.image,
    awards: item.awards,
  }));

export const homeData = {
  profile,
  stats,
  featuredWork,
};
