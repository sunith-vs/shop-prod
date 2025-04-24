export type Course = {
    id: number;
    title: string;
    description: string | null;
    imageUrl: string | '';
    board: string[];
    tab_title: string;
    tab_id: number;
};
