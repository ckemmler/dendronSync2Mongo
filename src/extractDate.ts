import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

const dateRe = /\d{4}.\d{2}.\d{2}/m
dayjs.extend(customParseFormat)

export default function extractDate(fileName: string): Dayjs | null {
    const match = fileName.match(dateRe)
    if (match) {
        return dayjs(match[0], 'YYYY.MM.DD')
    }
    return null;
}
