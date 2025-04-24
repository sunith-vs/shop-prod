export type OurCourse = {
    id: string;
    title: string;
    slug: string;
    sub_heading: string;
    description: string;
    highlights: string[];
    brochure_url: string;
    tagUrl: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    thumbnail: string;
    popular: boolean;
    courseType: string;
    eduportCourseId: number | null;
    bannerUrl: string;
    bannerMobile: string | null;
    board: string[];
}
