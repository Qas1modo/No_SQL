import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Assuming the files are named queries.csv and located in the given directories
file_path_arrangodb = './benchmark_arrangodb_kv/queries.csv'
file_path_redis = './benchmark_redis/queries.csv'

# Load the CSV files into pandas DataFrames
df_arrangodb = pd.read_csv(file_path_arrangodb)
df_redis = pd.read_csv(file_path_redis)

# Perform union operation
df_union = pd.concat([df_arrangodb, df_redis])

# Displaying the resulting DataFrame
df_union.head()

# Setting specific colors for Redis and ArangoDB
colors = {"redis": "red", "arangodb": "yellow"}

plt.figure(figsize=(10, 6))
sns.barplot(x="repetitions",
            y="avg_time",
            hue="database",
            data=df_union,
            palette=colors)

plt.title("Average Time of Queries by Database")
plt.xlabel("Repetitions")
plt.ylabel("Average Time (ms)")
plt.xticks(rotation=45)
plt.legend(title='Database')
plt.tight_layout()

# Display the updated plot with specific colors
file_path = './queries_comparison_chart_redis.png'

plt.savefig(file_path)
