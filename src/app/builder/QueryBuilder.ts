import { FilterQuery, Query } from "mongoose";

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  //searching
  search(searchableFields: string[]) {
    if (this?.query?.searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: {
                $regex: this.query.searchTerm,
                $options: "i",
              },
            } as FilterQuery<T>)
        ),
      });
    }
    return this;
  }

  //filtering
  filter() {
    const queryObj = { ...this.query };
    const excludeFields = [
      "searchTerm",
      "sort",
      "page",
      "limit",
      "fields",
      "withLocked",
      "showHidden",
      "download",
    ];
    excludeFields.forEach((el) => delete queryObj[el]);

    this.modelQuery = this.modelQuery.find(
      cleanObject(queryObj) as FilterQuery<T>
    );
    return this;
  }

  //sorting
  sort() {
    let sort = (this?.query?.sort as string) || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }

  //pagination
  paginate() {
    let limit = Number(this?.query?.limit) || 10;
    let page = Number(this?.query?.page) || 1;
    let skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  //fields filtering
  fields() {
    let fields =
      (this?.query?.fields as string)?.split(",").join(" ") || "-__v";
    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }

  //populating
  populate(populateFields: string[], selectFields: Record<string, unknown>) {
    this.modelQuery = this.modelQuery.populate(
      populateFields.map((field) => ({
        path: field,
        select: selectFields[field],
      }))
    );
    return this;
  }

  //pagination information
  async getPaginationInfo() {
    const total = await this.modelQuery.model.countDocuments(
      this.modelQuery.getFilter()
    );
    const limit = Number(this?.query?.limit) || 10;
    const page = Number(this?.query?.page) || 1;
    const totalPage = Math.ceil(total / limit);

    return {
      total,
      limit,
      page,
      totalPage,
    };
  }
}
function cleanObject(obj: Record<string, any>) {
  const cleaned: Record<string, any> = {};

  for (const key in obj) {
    const value = obj[key];

    // Skip null, undefined, empty string, empty array, or empty object
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      value !== "undefined" &&
      !(Array.isArray(value) && value.length === 0) &&
      !(
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0
      )
    ) {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export default QueryBuilder;