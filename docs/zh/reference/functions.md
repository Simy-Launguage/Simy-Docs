# 函数

```simy
fn calculate_damage(attacker: entity, victim: entity) -> num {
    let baseDamage = 5
    let damage = baseDamage * distance_multiplier(victim)
    return damage
}
```

- 返回类型用 `->` 标注；无返回类型时省略。
- 参数为 `name: Type` 形式，多个参数以 `,` 分隔。
- 函数体是 `{ }` 作用域块。
- **函数名强制 `snake_case`**（见[命名与命名空间](/zh/reference/conventions)）。

## 调用函数

`foo(a)` 恒为函数调用，`foo a b` 恒为命令——是否有括号是二者的分界：

```simy
calc_damage(victim)   // 函数调用
calc_damage victim    // 命令（头 `calc_damage` + 参数 `victim`）
```

命令形式见[命令与 Minecraft 原子](/zh/reference/commands)。

## 提前返回

`return` 会退出所在函数。在 `fn` 体内它是返回语句；在模块顶层则回落为普通标识符
（`/return run …` 命令仍可用）：

```simy
fn pick(value: num) -> num {
    if value < 0 {
        return 0
    }
    return value
}
```
