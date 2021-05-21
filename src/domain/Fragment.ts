import ILink from "./ILink";

export default class Fragment implements ILink {

  tags: string[] = []
  content: string | undefined

  constructor(public noteId: string, public date: Date) {
  }
}
