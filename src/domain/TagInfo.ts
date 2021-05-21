/* eslint-disable no-useless-constructor */
export default class TagInfo {
  public constructor(
    public tagIndex: number,
    public tagLength: number,
    public tag: string
  ) {}

  get offset() {
    return this.tagIndex + this.tagLength
  }
}
