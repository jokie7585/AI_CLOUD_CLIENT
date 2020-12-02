import { Injectable } from '@angular/core';
import {CommandTemplete, optionTemplete} from 'src/myservice/agentCtr.service'
import {CytusBatchConst} from 'src/utility/CetusProtocol'


const colorMap = {
    reservedWord: 'yellow',

}

interface boundWord {
    content: string,
    styleClass: string
}

// A line of renderContent
interface renderUnit {
    wordSet: Array<boundWord>,
}


@Injectable({
  providedIn: 'root'
})
export class pythonCodeEditorCompilerService {

    private sourceTemp: string;
    private renderContent: Array<renderUnit> 
    private _indent: string = '\t'
    private _whiteSpace: string = ' '
    private _indentlevelCounter: number = 0
    private _htmlTag = {
      switchLine: '<br>'
    }

  constructor() {

  }

  parseFromCommandTemplete(optionTemplete:Array<optionTemplete>): string{
    let result = ''

    
    result = result.concat(this.generateArgParseSetArgs(optionTemplete))
  
    result = result.concat(this.generateArgParseAssignment(optionTemplete))
    

    console.log('result of compile : '+  result)

    return result
  }


  PaseFromSource(source: string) {

  }


  private generateArgParseSetArgs(template: Array<optionTemplete>): string {
    let result = `parser = argparse.ArgumentParser()${this._htmlTag.switchLine}`;
    for(let el of template) {
        let nameOfParam = el.name.match(/[-]{0,2}([A-Z_a-z][A-Z_a-z0-9]*)/)[1];
        if(el.type == 'flag') {
          result = result.concat(`parser.add_argument("-${nameOfParam.charAt(0)}","--${nameOfParam}",nargs='?',const=${this._wrape_reservedvalue(CytusBatchConst.CytusTrue)},default=${this._wrape_reservedvalue(CytusBatchConst.CytusFalse)})${this._htmlTag.switchLine}`)
        }
        else if (el.type == 'option') {
          result = result.concat(`parser.add_argument("--${nameOfParam}")${this._htmlTag.switchLine}`)
        }
        else if (el.type == 'position') {
          result = result.concat(`parser.add_argument("${nameOfParam}",nargs='?')${this._htmlTag.switchLine}`)
        }
        
      
    }
    return result
  }

  private generateArgParseAssignment(template: Array<optionTemplete>): string {
    let result = `arges = parser.parse_args()${this._htmlTag.switchLine}`;
    for(let el of template) {
      let nameOfParam = el.name.match(/[--]{0,2}([A-Z_a-z][A-Z_a-z0-9]*)/)[1];
      result = result.concat(`${this._wrape_reservedWord('if')}${this._whiteSpace}arges.${nameOfParam}:${this._htmlTag.switchLine}${this._indent}${this._wrape_Command('# add your code')}${this._htmlTag.switchLine}${this._indent}${this._wrape_reservedWord('pass')}${this._htmlTag.switchLine}${this._htmlTag.switchLine}`)
    }
    return result
  }


  private parser(): renderUnit {
    return 
  }

  private _wrape_reservedWord(str: string) {
      return `<span class="py-reserved">${str}</span>`
  }

  private _wrape_reservedvalue(str: string) {
    return `<span class="py-reservedvalue">${str}</span>`
}

  private _wrape_Command(str: string){
    return `<span class="py-command">${str}</span>`
  }




}
