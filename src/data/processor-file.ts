import { Serializable } from 'external/gs_tools/src/data';
import { DataModels, field } from 'external/gs_tools/src/datamodel';
import { FunctionParser } from 'external/gs_tools/src/parse/function-parser';

import { File, getInitMap_ } from '../data/file';
import { FileType } from '../data/file-type';
import { Source } from '../datasource';

@Serializable('data.ProcessorFile')
export abstract class ProcessorFile extends File {
  @field('fn', FunctionParser.oneParam()) readonly fn_!: (arg: any) => any;

  getFunction(): (arg: any) => any {
    return this.fn_;
  }

  getSearchIndex(): string {
    return this.getName();
  }

  toString(): string {
    return `ProcessorFile(${this.name_})`;
  }

  static newInstance(
      id: string,
      name: string,
      parentId: string,
      fnString: string,
      source: Source): ProcessorFile {
    return DataModels.newInstance(
        ProcessorFile,
        getInitMap_(id, name, parentId, FileType.PROCESSOR, source)
            .set('fn_', FunctionParser.oneParam().parse(fnString)));
  }
}
