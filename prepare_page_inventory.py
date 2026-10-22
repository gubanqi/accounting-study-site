"""从本地已核对的逐页提取稿生成可重建的页码目录，不需要网络。"""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parent
data=json.loads((root/'dist/chapters.json').read_text(encoding='utf-8'))
inventory={}
for c in data['chapters']:
    sources=[]
    for source in c['sources']:
        text=(root/'references'/Path(source['title']).with_suffix('.txt')).read_text(encoding='utf-8')
        chunks=re.split(r'=== 第(\d+)页 ===\n',text)
        pages=[]
        for i in range(1,len(chunks),2):
            number=int(chunks[i]);body=chunks[i+1].strip()
            compact=re.sub(r'\s+',' ',body)
            heading=compact[:94]
            if number==1:kind='封面';heading='会计学课程封面'
            elif 'End of this Chapter' in body:kind='结束页'
            elif len(compact)<6:kind='空白或分隔页';heading='空白或仅有章节分隔编号'
            elif (number in (3,4) and ('掌握' in body or '学习目标' in body)):kind='学习要求'
            elif number==4 and ('录' in body or '目' in body):kind='目录'
            elif c['id']=='1' and number==2:kind='课程与考试说明'
            elif c['id']=='1' and number==3:kind='签到信息'
            elif c['id']=='1' and number==5:kind='目录'
            elif c['id']=='1' and number in (7,22):kind='任务分隔页'
            else:kind='教学内容'
            pages.append(dict(page=number,heading=heading,kind=kind))
        goals=re.search(r'=== 第(?:3|4)页 ===\n([^=]*?(?:掌握|学习目标)[^=]*)',text)
        sources.append(dict(title=source['title'],pages=pages,goals=re.sub(r'\s+',' ',goals.group(1)).strip() if goals else ''))
    inventory[c['id']]=sources
(root/'source-pages.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2),encoding='utf-8')
print('page inventory:',sum(len(s['pages']) for a in inventory.values() for s in a))
