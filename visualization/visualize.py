import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Assuming the files are named queries.csv and located in the given directories
file_path_arrangodb = '../benchmark_arrangodb/queries.csv'
file_path_mongodb = '../benchmark_mongodb/queries.csv'

# Load the CSV files into pandas DataFrames
df_arrangodb = pd.read_csv(file_path_arrangodb)
df_mongodb = pd.read_csv(file_path_mongodb)

# Perform union operation
df_union = pd.concat([df_arrangodb, df_mongodb])

# Displaying the resulting DataFrame
df_union.head()

# Setting specific colors for MongoDB and ArangoDB
colors = {"mongodb": "green", "arangodb": "yellow"}

plt.figure(figsize=(10, 6))
sns.barplot(x="query_name", y="avg_time", hue="database", data=df_union, palette=colors)

plt.title("Average Time of Queries by Database")
plt.xlabel("Query Name")
plt.ylabel("Average Time (ms)")
plt.xticks(rotation=45)
plt.legend(title='Database')
plt.tight_layout()

# Display the updated plot with specific colors
file_path = './queries_comparison_chart.png'

plt.savefig(file_path)