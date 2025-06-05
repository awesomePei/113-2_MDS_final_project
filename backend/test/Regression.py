# prompt: a basic EDA for a dataset

import pandas as pd

# Load the dataset
df = pd.read_csv('./backend/uploads/DataCoSupplyChainDataset.csv', encoding='latin-1')

# prompt: create a columns for Days for shipping (real)  Days for shipment (scheduled), 1 for delay, 0 for not delay, and give me the amount and statistic for both

# Create the 'Days for shipping (real)' and 'Days for shipment (scheduled)' columns
df['Days for shipping (real)'] = df['Days for shipping (real)'].astype(int)
df['Days for shipment (scheduled)'] = df['Days for shipment (scheduled)'].astype(int)

# Create the 'delay' column (1 for delay, 0 for not delay)
df['delay'] = (df['Days for shipping (real)'] > df['Days for shipment (scheduled)']).astype(int)


# prompt: For numeric columns, identify outlier and missing value
df = df.drop(columns = ["Customer Id"])
# Identify numeric columns
numeric_cols = df.select_dtypes(include=['number']).columns

print("\nIdentifying outliers and missing values for numeric columns:")

for col in numeric_cols:
    print(f"\nAnalyzing column: {col}")

    # Missing values
    missing_count = df[col].isnull().sum()
    print(f"  Missing values: {missing_count}")

    # Outliers (using Z-score)
    # We'll calculate Z-scores and consider values with |Z-score| > 3 as outliers
    if missing_count == 0: # Avoid calculating z-score on columns with NaNs
        mean = df[col].mean()
        std = df[col].std()
        if std > 0: # Avoid division by zero
            z_scores = (df[col] - mean) / std
            outliers = df[(abs(z_scores) > 3)]
            print(f"  Potential outliers (Z-score > 3 or < -3): {len(outliers)}")
            # You might want to inspect these rows, e.g., outliers.head()
        else:
            print("  Cannot calculate Z-scores, standard deviation is zero.")
    else:
        print("  Skipping outlier detection for Z-score due to missing values.")

    # Outliers (using IQR)
    # We'll calculate the IQR and consider values outside 1.5 * IQR from Q1 and Q3 as outliers
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1

    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR

    iqr_outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
    print(f"  Potential outliers (IQR method): {len(iqr_outliers)}")
    # You might want to inspect these rows, e.g., iqr_outliers.head()


# prompt: remove all the Z-score > 3 outlier in numeric columns

from scipy.stats import zscore

# Identify numeric columns
numeric_cols = df.select_dtypes(include=['number']).columns

# Remove outliers based on Z-score > 3
# Create a boolean mask to identify rows where ANY numeric column has a Z-score > 3
outlier_mask = (df[numeric_cols].apply(zscore).abs() > 3).any(axis=1)

# Filter the DataFrame to keep rows that are NOT outliers
df_cleaned = df[~outlier_mask].copy()

print(f"\nOriginal number of rows: {len(df)}")
print(f"Number of rows after removing Z-score outliers: {len(df_cleaned)}")

# You can now work with df_cleaned which has Z-score outliers removed from numeric columns



# prompt: transform shipping date (DateOrders) into something I can process, maybe take it apart

# # # Convert 'DateOrders' to datetime objects
df['DateOrders'] = pd.to_datetime(df['shipping date (DateOrders)'])

# Extract date and time components
df['ShippingYear'] = df['DateOrders'].dt.year
df['ShippingMonth'] = df['DateOrders'].dt.month
df['ShippingDay'] = df['DateOrders'].dt.day
df['ShippingHour'] = df['DateOrders'].dt.hour
df['ShippingWeekday'] = df['DateOrders'].dt.weekday # Monday=0, Sunday=6
df = df.drop(columns = ['DateOrders'])
df = df.drop(columns = ['shipping date (DateOrders)'])

# prompt: transform 'order date (DateOrders)' into year, month, day, hour, weekday and drop ti

# Convert 'order date (DateOrders)' to datetime objects
df['order date (DateOrders)'] = pd.to_datetime(df['order date (DateOrders)'])

# Extract date and time components
df['OrderYear'] = df['order date (DateOrders)'].dt.year
df['OrderMonth'] = df['order date (DateOrders)'].dt.month
df['OrderDay'] = df['order date (DateOrders)'].dt.day
df['OrderHour'] = df['order date (DateOrders)'].dt.hour
df['OrderWeekday'] = df['order date (DateOrders)'].dt.weekday # Monday=0, Sunday=6

# Drop the original column
# df = df.drop(columns = ['order date (DateOrders)', 'DateOrders'])
df = df.drop(columns = ['order date (DateOrders)'])

df = df.drop(columns = ["Customer Password", 'Customer Fname', 'Customer Lname', 'Customer Email', 'Product Image'])

# prompt: for all object columns, remove the unique value that only appears once

# Remove unique values that appear only once in object columns
object_cols_to_process = df.select_dtypes(include=['object']).columns

for col in object_cols_to_process:
    value_counts = df[col].value_counts()
    unique_values_once = value_counts[value_counts == 1].index.tolist()
    if unique_values_once:
        print(f"Removing unique values appearing once in column '{col}': {unique_values_once}")
        df = df[~df[col].isin(unique_values_once)].copy()

print("\nNumber of unique values for object columns after removal:")
object_cols_after_removal = df.select_dtypes(include=['object']).columns
for col in object_cols_after_removal:
    unique_count = df[col].nunique()
    print(f"  Column '{col}': {unique_count} unique values")


df = df.drop(columns = ['Customer Street', 'Order City', 'Order State'])
df = df.drop(columns = ['Late_delivery_risk', 'Delivery Status'])
df = df.drop(columns = ['Order Zipcode', 'Product Description'])

# prompt: load the encoder and encoder the df
import joblib
# Load the saved encoder
loaded_encoder = joblib.load('./backend/model/one_hot_encoder.joblib')

# Select the object columns from the current state of df for encoding
# Ensure you select the same columns that were used for training the encoder
object_cols_to_encode_now = df.select_dtypes(include=['object']).columns

# Encode the selected object columns in the current DataFrame
encoded_data = loaded_encoder.transform(df[object_cols_to_encode_now])

# Convert the encoded data to a DataFrame
# Get the feature names from the encoder
encoded_feature_names = loaded_encoder.get_feature_names_out(object_cols_to_encode_now)
encoded_df = pd.DataFrame(encoded_data, columns=encoded_feature_names, index=df.index)

# Drop the original object columns from df
df_encoded = df.drop(columns=object_cols_to_encode_now)

# Concatenate the original DataFrame (without object columns) with the encoded DataFrame
df_encoded = pd.concat([df_encoded, encoded_df], axis=1)

print("\nDataFrame after loading encoder and applying encoding:")
print(df_encoded.head())
print("\nNumber of columns after re-encoding:", df_encoded.shape[1])
print("\nData types after re-encoding:")

df = df_encoded
# prompt: set up two kind of X and Y, one for predict 'Days for shipping (real)', one for  'delay' make sure to remove them both from X

# X and Y for 'Days for shipping (real)' prediction
X_shipping_real = df.drop(columns=['Days for shipping (real)', 'delay']).copy()
y_shipping_real = df['Days for shipping (real)'].copy()

from sklearn.model_selection import train_test_split

# prompt: train test split for # X and Y for 'Days for shipping (real)' prediction
# X_shipping_real = df.drop(columns=['Days for shipping (real)', 'delay']).copy()
# y_shipping_real = df['Days for shipping (real)'].copy()

X_shipping_real_train, X_shipping_real_test, y_shipping_real_train, y_shipping_real_test = train_test_split(X_shipping_real, y_shipping_real, test_size=0.2, random_state=42)

print("\nShape of X_shipping_real_train:", X_shipping_real_train.shape)
print("Shape of X_shipping_real_test:", X_shipping_real_test.shape)
print("Shape of y_shipping_real_train:", y_shipping_real_train.shape)
print("Shape of y_shipping_real_test:", y_shipping_real_test.shape)


# prompt: xg regression model to predict
import matplotlib.pyplot as plt
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import RobustScaler
from xgboost import XGBClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score

# Create a pipeline for regression with Imputer, Scaler, and XGBoost Regressor
pipeline_regression = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),  # Use median for imputation
    ('scaler', RobustScaler()), # RobustScaler for potential outliers
    ('xgb_reg', XGBRegressor(objective='reg:squarederror', random_state=42)) # XGBoost Regressor
])

# Fit the regression pipeline to the training data for 'Days for shipping (real)'
pipeline_regression.fit(X_shipping_real_train, y_shipping_real_train)

# Make predictions on the test data
y_shipping_real_pred = pipeline_regression.predict(X_shipping_real_test)

# Evaluate the regression model
mse = mean_squared_error(y_shipping_real_test, y_shipping_real_pred)
r2 = r2_score(y_shipping_real_test, y_shipping_real_pred)

print(f"\nRegression Model Performance for 'Days for shipping (real)':")
print(f"Mean Squared Error (MSE): {mse:.4f}")
print(f"R-squared (R2): {r2:.4f}")

# prompt: store the regression model
# Get the XGBoost Regressor model from the pipeline
xgb_reg_model = pipeline_regression.named_steps['xgb_reg']

# Get feature importances for the regression model
feature_importances_reg = xgb_reg_model.feature_importances_

# Get feature names from the training data
feature_names_reg = X_shipping_real_train.columns

# Create a pandas Series for better visualization
feature_importances_series_reg = pd.Series(feature_importances_reg, index=feature_names_reg)

# Sort feature importances in descending order
sorted_feature_importances_reg = feature_importances_series_reg.sort_values(ascending=False)

# Print the most significant features for regression
print("\nFeature Significance for 'Days for shipping (real)' prediction (sorted by importance):")
print(sorted_feature_importances_reg)

# Visualize the top features for regression
plt.figure(figsize=(10, 8))
sorted_feature_importances_reg.head(20).plot(kind='barh')
plt.title('Top 20 Most Significant Features for Days for Shipping Prediction')
plt.xlabel('Feature Importance')
plt.ylabel('Feature')
plt.gca().invert_yaxis() # Invert axis to have the most important at the top
plt.show()

# Export the regression pipeline to a file
pipeline_regression_filename = './backend/model/shipping_real_regression_pipeline.joblib'
joblib.dump(pipeline_regression, pipeline_regression_filename)

print(f"\nRegression Pipeline exported to: {pipeline_regression_filename}")
