import re

path = r'D:\KZ PROJECT\js\dialogues\personality\K6_akujo.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Step 1: Remove all reborn/devoted blocks (with 8-space indent)
# Match from "        // --- 重塑新生" to the end of devoted block
pattern = re.compile(
    r'        // --- 重塑新生.*?\n'
    r'        reborn: \[.*?\n        \],\n\n'
    r'        // --- 挚爱献身.*?\n'
    r'        devoted: \[.*?\n        \](,?\n?)'
    , re.DOTALL
)
content = pattern.sub(r'\1', content)

# Step 2: Remove any orphaned "        ],\n        ]" sequences
# This happens when broken was closed with ], and then we also had a devoted close
content = re.sub(r'        \],\n        \]', '        ]', content)

# Step 3: Insert correctly after each broken block
insert = '''        ],

        // --- 重塑新生（恐惧线终极） ---
        reborn: [
            ["…欢迎回来，主人。", "${target.name}平静地微笑着，眼神空洞而顺从。", "今天也请…使用我。"],
            ["…", "${target.name}静静地等待着，像一台被设定好程序的机器。", "我会听话的。"],
            ["哈啊…", "${target.name}发出了轻微的喘息，表情没有波澜。", "请继续。我不需要休息。"],
            ["…舒服吗？", "${target.name}用那双失去了自我的眼睛注视着${master.name}。", "只要您舒服…我就满足了。"],
            ["…主人。", "${target.name}像被设定好程序的玩偶，精准地执行着每一个动作。", "请把我…当作您的工具。"]
        ],

        // --- 挚爱献身（爱情线终极） ---
        devoted: [
            ["…您来了。", "${target.name}露出了温柔到令人心碎的笑容。", "我等了您…很久。"],
            ["…主人。", "${target.name}的眼中只有${master.name}的身影，仿佛全世界都不存在了。", "能为您献身…是我最大的幸福。"],
            ["哈啊…", "${target.name}的呼吸带着甜蜜的温度。", "您的触碰…比任何东西都珍贵。"],
            ["…请更多地使用我。", "${target.name}主动贴近${master.name}，眼中满是深情。", "我的全部…都属于您。"],
            ["…爱您。", "${target.name}在${master.name}耳边轻声呢喃。", "这份感情…比生命更长久……"]
        ]'''

# Find "        broken: [" followed by content, then "        ]"
# We need to insert AFTER the closing "        ]" of broken
# But before the next line (which should be "        }" or another state key)
def insert_after_broken(text):
    lines = text.split('\n')
    result = []
    i = 0
    while i < len(lines):
        result.append(lines[i])
        if 'broken: [' in lines[i] and lines[i].startswith('        '):
            # Look for the matching close
            j = i + 1
            while j < len(lines):
                result.append(lines[j])
                if lines[j].strip() == ']' and lines[j].startswith('        ]'):
                    # Found broken close
                    for il in insert.split('\n'):
                        result.append(il)
                    i = j + 1
                    break
                j += 1
            else:
                i += 1
        else:
            i += 1
    return '\n'.join(result)

content = insert_after_broken(content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
