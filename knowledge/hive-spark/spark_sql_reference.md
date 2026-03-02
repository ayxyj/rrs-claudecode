# Spark SQL 参考手册

> Spark SQL 语法、函数和最佳实践

## 基本信息

| 属性 | 值 |
|------|-----|
| 技术栈 | Apache Spark 3.5.x |
| 语言版本 | Spark SQL / HiveQL |
| 文档版本 | v1.0 |
| 更新日期 | 2024-01-15 |

## 核心语法

### CREATE TABLE

```sql
-- 创建内部表
CREATE TABLE table_name (
    col1 col1_type,
    col2 col2_type,
    ...
)
USING DELTAIED
LOCATION '/path/to/table';

-- 创建外部表
CREATE EXTERNAL TABLE table_name (
    col1 col1_type,
    col2 col2_type
)
LOCATION '/path/to/data'
FORMAT AS PARQUET;
```

### INSERT 操作

```sql
-- 插入数据（支持 Overwrite）
INSERT OVERWRITE TABLE target_table
SELECT col1, col2 FROM source_table
WHERE condition;
```

### 常用函数

| 函数类型 | 函数名 | 说明 | 示例 |
|----------|--------|------|------|
| 字符串 | `concat` | 连接字符串 | `concat(a, b)` |
| 字符串 | `substring` | 截取子串 | `substring(str, 1, 10)` |
| 字符串 | `trim` | 去除空格 | `trim(str)` |
| 字符串 | `upper`/`lower` | 大小写转换 | `upper(str)` |
| 日期 | `current_date` | 当前日期 | `current_date()` |
| 日期 | `date_add` | 日期加减 | `date_add(date, 7)` |
| 日期 | `date_format` | 日期格式化 | `date_format(date, 'yyyy-MM-dd')` |
| 日期 | `datediff` | 日期差 | `datediff(end, start)` |
| 数值 | `round` | 四舍五入 | `round(amount, 2)` |
| 数值 | `cast` | 类型转换 | `cast(value AS DECIMAL(10,2))` |
| 条件 | `CASE WHEN` | 条件判断 | `CASE WHEN x>0 THEN 1 ELSE 0 END` |
| 聚合 | `sum`/`count` | 求和/计数 | `sum(amount)` |
| 聚合 | `avg`/`max`/`min` | 平均/最大/最小 | `avg(score)` |

## 数据类型

| 类型 | 说明 | 示例 |
|------|------|------|
| STRING | 字符串 | `'hello'` |
| INT | 整数 | `123` |
| BIGINT | 长整数 | `123456789` |
| DECIMAL | 小数 | `DECIMAL(10,2)` |
| DATE | 日期 | `DATE '2024-01-15'` |
| TIMESTAMP | 时间戳 | `TIMESTAMP '2024-01-15 12:00:00'` |
| BOOLEAN | 布尔 | `true`/`false` |
| ARRAY | 数组 | `array(1, 2, 3)` |

## 最佳实践

### 性能优化

```sql
-- 1. 分区表查询，尽量利用分区剪裁
SELECT * FROM partition_table
WHERE pt_date = '2024-01-15'  -- 利用分区
  AND other_condition;

-- 2. 避免使用 SELECT *
SELECT col1, col2 FROM table_name;

-- 3. JOIN 优先过滤
SELECT a.*, b.col2
FROM table_a a
JOIN table_b b ON a.id = b.id
WHERE a.status = 'ACTIVE'        -- 先过滤再 JOIN
  AND b.status = 'ACTIVE';

-- 4. 使用 CTE 提高可读性
WITH filtered AS (
    SELECT * FROM table_name WHERE amount > 1000
)
SELECT count(*) FROM filtered;
```

### 数据质量检查

```sql
-- 检查空值
SELECT
    count(*) as total,
    count(*) - count(col1) as null_count,
    count(*) - count(col1) * 100.0 / count(*) as null_ratio
FROM table_name;

-- 检查重复值
SELECT col1, count(*) as cnt
FROM table_name
GROUP BY col1
HAVING count(*) > 1;

-- 检查值范围
SELECT min(amount), max(amount)
FROM table_name
WHERE amount IS NOT NULL;
```

## 环境配置

### 本地 Spark 执行

```bash
# 使用 Java 11 启动 Spark SQL
JAVA_HOME=$JAVA_HOME_11 spark-sql

# 连接本地 Hive Metastore
spark-sql --master local[*] \
    --conf spark.sql.warehouse.dir=~/hadoop/hive/warehouse
```

### 常用参数

| 参数 | 说明 |
|------|------|
| `spark.sql.warehouse.dir` | 数据仓库目录 |
| `spark.sql.shuffle.partitions` | Shuffle 分区数 |
| `spark.executor.memory` | 执行器内存 |
| `spark.sql.codegen.wholeStage` | 代码生成优化 |

## 常见问题

### Metastore 连接失败

```bash
# 检查 Metastore 服务
lsof -i :9083

# 启动 Metastore
nohup $HIVE_HOME/bin/hive --service metastore &
```

### 内存不足

```sql
-- 增加执行器内存
SET spark.executor.memory=4g;

-- 增加分区数
SET spark.sql.shuffle.partitions=200;
```

## 参考文档

- [Spark SQL 官方文档](https://spark.apache.org/docs/latest/sql-programming-guide.html)
- [Hive 语言手册](https://cwiki.apache.org/confluence/display/Hive/LanguageManual)
