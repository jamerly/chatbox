import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root, Code } from 'mdast'

const remarkOP: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'code', (node: Code) => {
      const { lang, value } = node
      
      // 检查是否是JCMD语法
      if (lang && lang.toUpperCase() === 'USER_OPERATION') {
        try {
          // 处理可能的转义字符
          let processedValue = value
          
          // 处理转义的换行符
          if (processedValue.includes('\\n')) {
            processedValue = processedValue.replace(/\\n/g, '\n')
          }
          
          // 处理转义的引号
          if (processedValue.includes('\\"')) {
            processedValue = processedValue.replace(/\\"/g, '"')
          }
          
          
          // 解析命令和参数
          const lines = processedValue.trim().split('\n')
          const firstLine = lines[0].trim()
          
          
          // 匹配命令格式: command {params}
          const commandMatch = firstLine.match(/^(\w+)\s*(\{.*\})?$/)
          
          if (commandMatch) {
            const command = commandMatch[1]
            const paramsStr = commandMatch[2] || '{}'
            
            
            // 解析JSON参数
            let params: Record<string, any> = {}
            try {
              params = JSON.parse(paramsStr)
            } catch (e) {
              // 尝试处理转义的JSON
              try {
                const unescapedParams = paramsStr.replace(/\\"/g, '"')
                params = JSON.parse(unescapedParams)
              } catch (e2) {
                console.warn('Failed to parse USER_OPERATION JSON params:', paramsStr)
              }
            }
            
            // 将JCMD信息存储在meta字段中
            const jcmdData = {
              command,
              params,
              content: lines.length > 1 ? lines.slice(1).join('\n') : '' // 处理单行指令
            }
            
            
            // 修改节点，将JCMD数据存储在meta字段中
            node.meta = JSON.stringify(jcmdData)
            node.lang = 'USER_OPERATION' // 使用特殊的语言标识
          }
        } catch (error) {
        }
      }
    })
  }
}

export default remarkOP