import ILink from "./ILink";

export default class Entity implements ILink {

    type: string | undefined;

    constructor(public noteId: string, public date: Date) {
    }
}