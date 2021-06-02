import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActionArea from "@material-ui/core/CardActionArea";

export const TotalCard = ({ classBaseName, title, amount, icon, onClick }) => (
  <div className={`${classBaseName}-total-card`}>
    <Card>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <div className="total-card__text">
            <Typography
              color="textSecondary"
              gutterBottom
              style={{ fontWeight: "bold" }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="h4"
              style={{ fontWeight: "bold" }}
            >
              £{amount}
            </Typography>
          </div>
          {icon && icon}
        </CardContent>
      </CardActionArea>
    </Card>
  </div>
);
